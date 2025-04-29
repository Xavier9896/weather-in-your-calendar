/**
 * 根据天气图标代码转换为对应表情符号
 * @param {string} weatherPic 天气图标代码
 * @returns {string} 对应的表情符号
 */
function weatherPicToEmoji(weatherPic) {
  // 移除图标代码中可能的前缀
  const code = weatherPic.replace(/^[dn]/, "");

  switch (code) {
    case "00":
      return "☀️"; // 晴
    case "01":
      return "🌤"; // 多云
    case "02":
      return "☁️"; // 阴
    case "03":
      return "🌦"; // 阵雨
    case "04":
      return "⛈"; // 雷阵雨
    case "05":
      return "⛈"; // 雷阵雨伴有冰雹
    case "06":
      return "🌨"; // 雨夹雪
    case "07":
      return "🌧"; // 小雨
    case "08":
      return "🌧"; // 中雨
    case "09":
      return "🌧"; // 大雨
    case "10":
      return "🌧"; // 暴雨
    case "11":
      return "🌧"; // 大暴雨
    case "12":
      return "🌧"; // 特大暴雨
    case "13":
      return "🌨"; // 阵雪
    case "14":
      return "🌨"; // 小雪
    case "15":
      return "🌨"; // 中雪
    case "16":
      return "🌨"; // 大雪
    case "17":
      return "🌨"; // 暴雪
    case "18":
      return "🌫"; // 雾
    case "19":
      return "🌧"; // 冻雨
    case "20":
      return "🌪"; // 沙尘暴
    case "21":
      return "🌧"; // 小到中雨
    case "22":
      return "🌧"; // 中到大雨
    case "23":
      return "🌧"; // 大到暴雨
    case "24":
      return "🌧"; // 暴雨到大暴雨
    case "25":
      return "🌧"; // 大暴雨到特大暴雨
    case "26":
      return "🌨"; // 小到中雪
    case "27":
      return "🌨"; // 中到大雪
    case "28":
      return "🌨"; // 大到暴雪
    case "29":
      return "🌫"; // 浮尘
    case "30":
      return "🌪"; // 扬沙
    case "31":
      return "🌪"; // 强沙尘暴
    case "53":
      return "🌫"; // 霾
    case "99":
      return "❓"; // 无数据
    case "301":
      return "🌧"; // 雨
    case "302":
      return "🌨"; // 雪
    default:
      return "🤔"; // 未知
  }
}

/**
 * 获取风向箭头表情符号
 * @param {number} deg 风向角度
 * @returns {string} 风向箭头
 */
function windDirectionArrow(deg) {
  const directions = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖", "↑"];
  return directions[Math.round(deg / 45) % 8];
}

/**
 * 获取风向文本描述
 * @param {number} deg 风向角度
 * @returns {string} 风向描述
 */
function windDirectionText(deg) {
  const directions = [
    "北",
    "东北",
    "东",
    "东南",
    "南",
    "西南",
    "西",
    "西北",
    "北",
  ];
  return directions[Math.round(deg / 45) % 8] + "风";
}

/**
 * 获取风力等级描述
 * @param {string} windPow 风力描述
 * @returns {string} 格式化后的风力描述
 */
function formatWindPower(windPow) {
  return windPow.replace(/</g, "小于");
}

/**
 * 创建天气描述
 * @param {Object} weatherData 天气数据对象
 * @returns {string} 格式化的天气描述
 */
function makeWeatherDescription(weatherData) {
  const emoji = weatherPicToEmoji(
    weatherData.day_weather_pic || weatherData.night_weather_pic || "",
  );
  let desc = `${emoji} ${weatherData.weather}\\n\\n`;

  // 添加日期信息
  desc += `📅 ${weatherData.time}\\n\\n`;

  // 添加温度信息
  desc += `🌡️ 温度 ${weatherData.temperature_min}℃ - ${weatherData.temperature_max}℃\\n\\n`;

  // 添加风向和风力信息
  if (weatherData.wind) {
    desc += `💨 风力 ${formatWindPower(weatherData.wind_pow)}\\n\\n`;
    desc += `🚩 风向 ${weatherData.wind}\\n\\n`;
  }

  // 添加天气图标信息
  if (weatherData.day_weather_pic) {
    desc += `🌞 白天: ${weatherPicToEmoji(weatherData.day_weather_pic)}\\n`;
  }
  if (weatherData.night_weather_pic) {
    desc += `🌙 夜间: ${weatherPicToEmoji(weatherData.night_weather_pic)}\\n`;
  }

  // 添加项目信息
  desc += `\\n📅 天气日历订阅服务\\n`;

  return desc;
}

export {
  weatherPicToEmoji,
  windDirectionArrow,
  windDirectionText,
  formatWindPower,
  makeWeatherDescription,
};
