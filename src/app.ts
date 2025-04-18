import express from 'express';
import cors from 'cors';
import { createCalendarRouter } from './routes/calendar.routes';
import { CalendarController } from './controllers/calendar.controller';
import { CaiyunWeatherService } from './services/weather/caiyun.service';
import { ICalendarService } from './services/calendar/icalendar.service';
import { MemoryCacheService } from './services/cache/memory-cache.service';

export function createApp(port: number = 3000) {
  const app = express();

  // 中间件
  app.use(express.json());
  app.use(cors());

  // 初始化服务
  const cache = new MemoryCacheService();
  const weatherService = new CaiyunWeatherService(cache);
  const calendarService = new ICalendarService();
  
  // 初始化控制器
  const calendarController = new CalendarController(
    weatherService,
    calendarService,
    `http://localhost:${port}/api/calendar/download`
  );

  // 注册路由
  app.use('/api/calendar', createCalendarRouter(calendarController));

  // 错误处理
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('服务器错误:', err);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  return app;
} 