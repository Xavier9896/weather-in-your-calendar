import express from "express";
import { getWeather } from "../services/weatherService.js";
import { generateWeatherCalendar } from "../services/calendarService.js";

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: 首页信息
 *     description: 返回欢迎信息
 *     tags:
 *       - 基本
 *     responses:
 *       200:
 *         description: 欢迎信息
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 欢迎使用日历天气订阅服务
 */
router.get("/", (req, res) => {
  res.send("欢迎使用日历天气订阅服务");
});

/**
 * @swagger
 * /weather:
 *   get:
 *     summary: 获取天气日历
 *     description: 返回指定地区的天气日历（iCal格式）。必须提供 areaCode、areaCn、ip 中的任意一个，或者同时提供 lng 和 lat。
 *     tags:
 *       - 天气日历
 *     parameters:
 *       - in: query
 *         name: areaCode
 *         description: 地区代码，例如370100（济南）
 *         schema:
 *           type: string
 *         example: "370100"
 *       - in: query
 *         name: areaCn
 *         description: 地区名称，例如济南
 *         schema:
 *           type: string
 *         example: "济南"
 *       - in: query
 *         name: ip
 *         description: IP地址
 *         schema:
 *           type: string
 *         example: "192.168.1.1"
 *       - in: query
 *         name: lng
 *         description: 经度
 *         schema:
 *           type: string
 *         example: "117.1205"
 *       - in: query
 *         name: lat
 *         description: 纬度
 *         schema:
 *           type: string
 *         example: "36.6510"
 *       - in: query
 *         name: temperature
 *         description: 温度显示格式
 *         schema:
 *           type: string
 *           enum: [day, minmax]
 *           default: minmax
 *         example: "minmax"
 *       - in: query
 *         name: location
 *         description: 是否显示位置
 *         schema:
 *           type: string
 *           enum: [show, hide]
 *           default: show
 *         example: "show"
 *     responses:
 *       200:
 *         description: iCal格式的天气日历
 *         content:
 *           text/calendar:
 *             schema:
 *               type: string
 *       400:
 *         description: 参数错误
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: "必须提供 areaCode、areaCn、ip 中的任意一个，或者同时提供 lng 和 lat"
 *       500:
 *         description: 服务器错误
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: "服务器错误: 获取天气数据失败"
 */
router.get("/weather-cal", async (req, res) => {
  try {
    // 获取请求参数
    const {
      areaCode,
      areaCn,
      ip,
      lng,
      lat,
      temperature = "day",
      location = "show",
    } = req.query;

    // 验证必要参数
    if (!areaCode && !areaCn && !ip && (!lng || !lat)) {
      return res
        .status(400)
        .send(
          "必须提供 areaCode、areaCn、ip 中的任意一个，或者同时提供 lng 和 lat",
        );
    }

    // 验证温度显示格式
    if (temperature !== "day" && temperature !== "minmax") {
      return res.status(400).send("参数错误：temperature 只能是 day 或 minmax");
    }

    // 验证位置显示选项
    if (location !== "show" && location !== "hide") {
      return res.status(400).send("参数错误：location 只能是 show 或 hide");
    }

    // 获取天气数据
    const weatherData = await getWeather({ areaCode, areaCn, ip, lng, lat });

    // 生成日历数据
    const calendar = generateWeatherCalendar(weatherData, {
      temperature,
      location,
    });

    // 设置响应头
    res.setHeader("Content-Type", calendar.contentType);

    // 对文件名进行URL编码
    const encodedFilename = encodeURIComponent(calendar.filename);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodedFilename}`,
    );

    // 发送日历数据
    res.send(calendar.calendar);
  } catch (error) {
    console.error("处理天气日历请求失败:", error);
    res.status(500).send(`服务器错误: ${error.message}`);
  }
});

export default router;
