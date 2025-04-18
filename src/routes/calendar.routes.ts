import { Router } from 'express';
import { CalendarController } from '@/controllers/calendar.controller';

export function createCalendarRouter(controller: CalendarController): Router {
  const router = Router();

  /**
   * @api {post} /api/calendar/generate 生成天气日历
   * @apiName GenerateCalendar
   * @apiGroup Calendar
   * @apiVersion 1.0.0
   *
   * @apiParam {Object} location 位置信息
   * @apiParam {String} location.name 位置名称
   * @apiParam {String} location.country 国家
   * @apiParam {Object} location.coordinates 坐标
   * @apiParam {Number} location.coordinates.lat 纬度
   * @apiParam {Number} location.coordinates.lon 经度
   * @apiParam {Number} [days=7] 天数
   * @apiParam {String} [filename=weather-calendar.ics] 文件名
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiSuccess {String} message 消息
   * @apiSuccess {Object} data 数据
   * @apiSuccess {String} data.calendarContent 日历内容
   * @apiSuccess {String} data.downloadUrl 下载链接
   */
  router.post('/generate', controller.generateCalendar);

  /**
   * @api {get} /api/calendar/download/:filename 下载日历文件
   * @apiName DownloadCalendar
   * @apiGroup Calendar
   * @apiVersion 1.0.0
   *
   * @apiParam {String} filename 文件名
   */
  router.get('/download/:filename', controller.downloadCalendar);

  return router;
} 