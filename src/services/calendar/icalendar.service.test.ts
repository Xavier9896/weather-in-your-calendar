import { ICalendarService } from './icalendar.service';
import { CalendarEvent } from '@/interfaces/calendar.interface';
import fs from 'fs/promises';
import path from 'path';

describe('ICalendarService', () => {
  let service: ICalendarService;
  let testEvents: CalendarEvent[];

  beforeEach(() => {
    service = new ICalendarService();
    testEvents = [
      {
        id: '1',
        title: '测试事件1',
        description: '这是一个测试事件',
        startTime: new Date('2024-04-20T00:00:00'),
        endTime: new Date('2024-04-21T00:00:00'),
        location: '北京',
        weather: {
          temperature: 25,
          description: '晴天',
          icon: '☀️',
          humidity: 60,
          pressure: 1013,
          wind: {
            speed: 3,
            direction: '东北风'
          },
          sunrise: new Date('2024-04-20T05:30:00'),
          sunset: new Date('2024-04-20T18:30:00')
        }
      }
    ];
  });

  describe('generateCalendar', () => {
    it('应该生成有效的iCalendar格式内容', async () => {
      const result = await service.generateCalendar(testEvents);
      
      expect(result).toContain('BEGIN:VCALENDAR');
      expect(result).toContain('BEGIN:VEVENT');
      expect(result).toContain('END:VEVENT');
      expect(result).toContain('END:VCALENDAR');
      expect(result).toContain('X-WR-CALNAME:Weather for 北京');
      expect(result).toContain('X-APPLE-CALENDAR-COLOR:#ffffff');
    });

    it('应该生成正确的事件标题', async () => {
      const result = await service.generateCalendar(testEvents);
      expect(result).toContain('SUMMARY;LANGUAGE=en:☀️ 25°C');
    });

    it('应该生成正确的天气描述', async () => {
      const result = await service.generateCalendar(testEvents);
      expect(result).toContain('☀️ 晴天');
      expect(result).toContain('🌡️ 温度: 25°C');
      expect(result).toContain('💧 湿度: 60%');
      expect(result).toContain('⚡️ 气压: 1013hPa');
      expect(result).toContain('💨 风速: 3m/s');
      expect(result).toContain('🚩 风向: 东北风');
      expect(result).toContain('🌅 日出: 05:30');
      expect(result).toContain('🌇 日落: 18:30');
    });

    it('应该正确处理全天事件', async () => {
      const result = await service.generateCalendar(testEvents);
      expect(result).toContain('X-FUNAMBOL-ALLDAY:1');
      expect(result).toContain('X-MICROSOFT-CDO-ALLDAYEVENT:TRUE');
      expect(result).toContain('DTSTART;VALUE=DATE:20240420');
      expect(result).toContain('DTEND;VALUE=DATE:20240421');
    });

    it('应该正确处理特殊字符', async () => {
      const eventWithSpecialChars: CalendarEvent = {
        id: '2',
        title: '测试,事件;2',
        description: '包含\n换行',
        startTime: new Date('2024-04-21T00:00:00'),
        endTime: new Date('2024-04-22T00:00:00'),
        location: '测试,地点;'
      };

      const result = await service.generateCalendar([eventWithSpecialChars]);
      expect(result).toContain('测试\\,事件\\;2');
      expect(result).toContain('包含\\n换行');
      expect(result).toContain('测试\\,地点\\;');
    });
  });

  describe('saveCalendar', () => {
    const testFilename = 'test-calendar.ics';

    afterEach(async () => {
      try {
        await fs.unlink(path.join(process.cwd(), testFilename));
      } catch (error) {
        // 文件可能不存在，忽略错误
      }
    });

    it('应该成功保存日历文件', async () => {
      const content = await service.generateCalendar(testEvents);
      await service.saveCalendar(content, testFilename);

      const fileContent = await fs.readFile(path.join(process.cwd(), testFilename), 'utf-8');
      expect(fileContent).toBe(content);
    });
  });
}); 