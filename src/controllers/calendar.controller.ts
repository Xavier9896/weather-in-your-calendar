import { Request, Response } from 'express';
import { WeatherProvider, WeatherForecast, WeatherData } from '@/interfaces/weather.interface';
import { CalendarProvider, CalendarEvent } from '@/interfaces/calendar.interface';
import { GenerateCalendarRequest, GenerateCalendarResponse, ErrorResponse } from '@/interfaces/api.interface';
import path from 'path';

export class CalendarController {
  constructor(
    private weatherProvider: WeatherProvider,
    private calendarProvider: CalendarProvider,
    private downloadBaseUrl: string = 'http://localhost:3000/download'
  ) {}

  /**
   * 生成天气日历
   */
  generateCalendar = async (
    req: Request<Record<string, never>, GenerateCalendarResponse | ErrorResponse, GenerateCalendarRequest>,
    res: Response<GenerateCalendarResponse | ErrorResponse>
  ) => {
    try {
      const { location, days = 7, filename = 'weather-calendar.ics' } = req.body;

      // 获取天气预报
      const forecast = await this.weatherProvider.getForecast(location);

      // 生成日历事件
      const events: CalendarEvent[] = forecast.daily.slice(0, days).map((day: WeatherData) => ({
        id: day.date.toISOString(),
        title: `${day.description} ${day.icon}`,
        description: '',
        startTime: day.date,
        endTime: new Date(day.date.getTime() + 24 * 60 * 60 * 1000),
        location: location.name,
        weather: {
          temperature: day.temperature.current,
          description: day.description,
          icon: day.icon,
          humidity: day.humidity,
          pressure: day.pressure,
          wind: day.wind,
          sunrise: day.sunrise,
          sunset: day.sunset
        }
      }));

      // 生成日历内容
      const calendarContent = await this.calendarProvider.generateCalendar(events);

      // 保存日历文件
      const safeFilename = this.sanitizeFilename(filename);
      await this.calendarProvider.saveCalendar(calendarContent, safeFilename);

      // 返回结果
      res.json({
        success: true,
        message: '日历生成成功',
        data: {
          calendarContent,
          downloadUrl: `${this.downloadBaseUrl}/${safeFilename}`
        }
      });
    } catch (error) {
      console.error('生成日历失败:', error);
      res.status(500).json({
        success: false,
        message: '生成日历失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * 下载日历文件
   */
  downloadCalendar = async (req: Request, res: Response) => {
    try {
      const filename = this.sanitizeFilename(req.params.filename);
      const filePath = path.join(process.cwd(), filename);
      
      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.sendFile(filePath);
    } catch (error) {
      console.error('下载日历失败:', error);
      res.status(500).json({
        success: false,
        message: '下载日历失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /**
   * 清理文件名以防止路径遍历攻击
   */
  private sanitizeFilename(filename: string): string {
    return path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, '_');
  }
} 