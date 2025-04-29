import dayjs from "dayjs";
import {
  weatherPicToEmoji,
  makeWeatherDescription,
} from "../utils/emojiUtils.js";

/**
 * 生成完整的iCal日历
 * @param {Object} weatherData 天气数据
 * @param {Object} options 选项
 * @returns {string} 完整的iCal日历
 */
function generateCalendar(weatherData, options = {}) {
  const { temperature = "day", location = "show" } = options;
  const { cityInfo, days } = weatherData;

  // 构建日历头部
  let calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//weather-calendar//v1.0//CN",
    `X-WR-CALNAME:${cityInfo.areaCn}天气`,
    "CALSCALE:GREGORIAN",
  ].join("\r\n");

  // 为每一天生成事件
  days.forEach((day) => {
    // 构建温度显示
    let tempDisplay;
    if (temperature === "day") {
      tempDisplay = `${day.temperature_max || day.temperature_min}℃`;
    } else {
      tempDisplay =
        [day.temperature_max, day.temperature_min].filter(Boolean).join("℃/") +
        "℃";
    }

    // 构建事件摘要
    const summary =
      `${weatherPicToEmoji(day.day_weather_pic || day.night_weather_pic || "")} ${day.weather} ${tempDisplay}`.replace(
        /℃+/g,
        "°",
      );

    const event = [
      "BEGIN:VEVENT",
      `SUMMARY;LANGUAGE=zh-CN:${summary}`,
      "X-FUNAMBOL-ALLDAY:1",
      `UID:${dayjs(day.date).format("YYYYMMDD")}@weather-calendar`,
      `DTSTAMP:${dayjs().format("YYYYMMDDTHHmmss")}Z`,
      `DTSTART;VALUE=DATE:${dayjs(day.date).format("YYYYMMDD")}`,
      `URL;VALUE=URI:weather.rss-calendar.cn`,
      `DTEND;VALUE=DATE:${dayjs(day.date).add(1, "day").format("YYYYMMDD")}`,
      "X-MICROSOFT-CDO-ALLDAYEVENT:TRUE",
    ];

    // 添加位置信息（如果启用）
    if (location === "show") {
      event.push(`LOCATION:${cityInfo.areaCn}`);
    }

    const description = makeWeatherDescription(day).repeat(/℃+/g, "°");

    // 添加描述信息
    event.push(`DESCRIPTION;LANGUAGE=zh-CN:${description}`);

    event.push("END:VEVENT");
    calendar += "\r\n" + event.join("\r\n");
  });

  // 添加日历尾部
  calendar += "\r\nEND:VCALENDAR";

  return calendar;
}

/**
 * 生成iCal格式的天气日历
 * @param {Object} weatherData 天气数据
 * @param {Object} options 选项
 * @returns {Object} 日历响应对象
 */
function generateWeatherCalendar(weatherData, options = {}) {
  const calendar = generateCalendar(weatherData, options);
  const filename = `${weatherData.cityInfo.areaCn}天气.ics`;

  return {
    calendar,
    contentType: "text/calendar; charset=utf-8",
    filename,
  };
}

export { generateWeatherCalendar };
