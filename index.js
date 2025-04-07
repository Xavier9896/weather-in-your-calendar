require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const moment = require('moment');
const { areaList } = require('@vant/area-data');

const app = express();
const port = process.env.PORT || 3000;

// 天气图标转换
const skyconToEmoji = (skycon) => {
  const emojiMap = {
    'CLEAR_DAY': '☀️',
    'CLEAR_NIGHT': '✨',
    'PARTLY_CLOUDY_DAY': '🌤',
    'PARTLY_CLOUDY_NIGHT': '🌤',
    'CLOUDY': '☁️',
    'LIGHT_RAIN': '🌧',
    'MODERATE_RAIN': '🌧',
    'HEAVY_RAIN': '🌧',
    'STORM_RAIN': '⛈',
    'FOG': '🌫',
    'LIGHT_SNOW': '🌨',
    'MODERATE_SNOW': '🌨',
    'HEAVY_SNOW': '🌨',
    'STORM_SNOW': '🌨',
    'DUST': '🌫',
    'SAND': '🌫',
    'WIND': '💨'
  };
  return emojiMap[skycon] || '🤔';
};

// 天气代码转中文
const skyconToChinese = (skycon) => {
  const chineseMap = {
    'CLEAR_DAY': '晴天',
    'CLEAR_NIGHT': '晴夜',
    'PARTLY_CLOUDY_DAY': '多云',
    'PARTLY_CLOUDY_NIGHT': '多云',
    'CLOUDY': '阴',
    'LIGHT_RAIN': '小雨',
    'MODERATE_RAIN': '中雨',
    'HEAVY_RAIN': '大雨',
    'STORM_RAIN': '暴雨',
    'FOG': '雾',
    'LIGHT_SNOW': '小雪',
    'MODERATE_SNOW': '中雪',
    'HEAVY_SNOW': '大雪',
    'STORM_SNOW': '暴雪',
    'DUST': '浮尘',
    'SAND': '沙尘',
    'WIND': '大风'
  };
  return chineseMap[skycon] || '未知天气';
};

// 风向角度转文字
const windDirectionPro = (deg) => {
  const directions = ['北', '北东北', '东北', '东东北', '东', '东东南', '东南', '南东南', '南', '南西南', '西南', '西西南', '西', '西西北', '西北', '北西北', '北'];
  return directions[Math.round(deg / 22.5)];
};

// 风向角度转箭头
const windDirectionArrow = (deg) => {
  const directions = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖', '↑'];
  return directions[Math.round(deg / 45)];
};

// 生成天气描述
const makeDescriptions = (data) => {
  let desc = `${skyconToEmoji(data.skycon)} ${skyconToChinese(data.skycon)}\n\n`;
  desc += `🌅 日出 ${data.astro.sunrise.time} 日落 ${data.astro.sunset.time}\n\n`;
  desc += `⚡️ 气压 ${data.pressure.avg} 百帕\n\n`;
  desc += `💧 湿度 ${data.humidity.avg * 100}%\n\n`;
  desc += `💨 风速最高 ${data.wind.max.speed} 米/秒\n`;
  desc += `🚩 风向 ${windDirectionPro(data.wind.max.direction)} ${windDirectionArrow(data.wind.max.direction)}\n\n`;
  desc += `🌡 温度: ${data.temperature.min}°C ~ ${data.temperature.max}°C\n\n`;
  desc += `☔️ 降水量: ${data.precipitation.avg}毫米 (${data.precipitation.probability}%)\n\n`;
  desc += '数据来源: 彩云天气API';
  return desc;
};

// 显示温度
const displayTemp = (temp, display) => {
  if (display === 'day') {
    return `${Math.round(temp.avg)}°`;
  }
  return `${Math.round(temp.min)}°/${Math.round(temp.max)}°`;
};

// 通过城市名称查找对应的adcode
const findAdcodeByCity = (cityName) => {
  // 构建城市名称到adcode的映射
  const cityToAdcode = {};
  
  // 遍历省份
  Object.entries(areaList.province_list).forEach(([provinceCode, provinceName]) => {
    if (provinceName.includes(cityName)) {
      // 处理直辖市和特别行政区等省级城市
      cityToAdcode[provinceName] = provinceCode.substring(0, 6);
    }
    
    // 遍历城市
    const cityList = Object.entries(areaList.city_list).filter(([code]) => code.substring(0, 2) === provinceCode.substring(0, 2));
    cityList.forEach(([cityCode, name]) => {
      if (name.includes(cityName)) {
        cityToAdcode[name] = cityCode.substring(0, 6);
      }
    });
  });
  
  // 如果有多个匹配项，优先返回精确匹配的
  const exactMatch = Object.entries(cityToAdcode).find(([name]) => name === cityName);
  if (exactMatch) {
    return exactMatch[1];
  }
  
  // 否则返回第一个包含该名称的城市
  const keys = Object.keys(cityToAdcode);
  if (keys.length > 0) {
    return cityToAdcode[keys[0]];
  }
  
  return null;
};

// 获取天气数据
const getWeatherData = async (options) => {
  if (!process.env.CAIYUN_API_KEY) {
    throw new Error('未找到API密钥');
  }

  let apiUrl;
  let cityName = '';
  
  if (options.city) {
    // 通过城市名称获取adcode
    const adcode = findAdcodeByCity(options.city);
    if (!adcode) {
      throw new Error(`找不到城市 "${options.city}" 的编码`);
    }
    cityName = options.city;
    // 使用城市代码获取天气
    apiUrl = `https://api.caiyunapp.com/v2.6/${process.env.CAIYUN_API_KEY}/weather.json?adcode=${adcode}&dailysteps=15`;
    options.adcode = adcode; // 保存找到的adcode供后续使用
  } else if (options.adcode) {
    // 使用城市代码获取天气
    apiUrl = `https://api.caiyunapp.com/v2.6/${process.env.CAIYUN_API_KEY}/weather.json?adcode=${options.adcode}&dailysteps=15`;
  } else if (options.lng && options.lat) {
    // 使用经纬度获取天气
    apiUrl = `https://api.caiyunapp.com/v2.6/${process.env.CAIYUN_API_KEY}/${options.lng},${options.lat}/daily?dailysteps=15`;
  } else {
    throw new Error('必须提供城市名称、adcode或经纬度');
  }

  const response = await fetch(apiUrl);
  const weatherData = await response.json();

  if (weatherData.status !== 'ok') {
    throw new Error(weatherData.error || '获取天气数据失败');
  }

  // 统一处理两种不同的数据格式
  let dailyData;
  if (options.adcode || options.city) {
    // adcode 格式返回的数据
    if (!weatherData.result.daily) {
      throw new Error('API返回的数据格式错误');
    }
    dailyData = weatherData.result.daily;
  } else {
    // 经纬度格式返回的数据
    dailyData = weatherData.result;
  }

  return { weatherData, cityName, dailyData };
};

app.get('/weather-cal', async (req, res) => {
  try {
    const { lat, lng, adcode, city, location = 'show', temperature = 'day' } = req.query;
    
    // 验证参数
    if (!city && !adcode && (!lat || !lng)) {
      throw new Error('必须提供城市名称、adcode或经纬度(lat和lng)');
    }

    // 获取天气数据
    const { weatherData, cityName, dailyData } = await getWeatherData({ lat, lng, adcode, city });
    
    // 设置位置描述
    let locationDesc = '';
    if (city || cityName) {
      locationDesc = city || cityName;
    } else if (adcode) {
      locationDesc = `adcode:${adcode}`;
    } else {
      locationDesc = `${lat},${lng}`;
    }

    // 设置响应头
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=weather-cal.ics');

    // 生成日历内容
    let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//天气日历//v1.0//CN
X-WR-CALNAME:${locationDesc}的天气预报
X-APPLE-CALENDAR-COLOR:#ffffff
CALSCALE:GREGORIAN\n`;

    // 处理天气数据并生成日历事件
    dailyData.skycon.forEach((item, index) => {
      const date = moment(item.date);
      
      // 获取对应日期的其他数据
      const temperatureData = dailyData.temperature[index];
      const precipitationData = dailyData.precipitation[index];
      const windData = dailyData.wind[index];
      const humidityData = dailyData.humidity[index];
      const pressureData = dailyData.pressure[index];
      const astroData = dailyData.astro[index];
      
      const dayWeather = {
        date: item.date,
        skycon: item.value,
        temperature: temperatureData,
        precipitation: precipitationData,
        wind: windData,
        humidity: humidityData,
        pressure: pressureData,
        astro: astroData
      };

      ical += `BEGIN:VEVENT
SUMMARY;LANGUAGE=zh:${skyconToEmoji(dayWeather.skycon)} ${skyconToChinese(dayWeather.skycon)} ${displayTemp(dayWeather.temperature, temperature)}
X-FUNAMBOL-ALLDAY:1
UID:${date.format('YYYYMMDD')}@weather-in-calendar
DTSTAMP;VALUE=DATE:${moment().format('YYYYMMDDTHHmmss')}
DTSTART;VALUE=DATE:${date.format('YYYYMMDD')}
${location === 'show' ? `LOCATION:${locationDesc}\n` : ''}X-MICROSOFT-CDO-ALLDAYEVENT:TRUE
URL;VALUE=URI:https://caiyunapp.com
DTEND;VALUE=DATE:${date.add(1, 'day').format('YYYYMMDD')}
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
DESCRIPTION;LANGUAGE=zh:${makeDescriptions(dayWeather)}
END:VEVENT\n`;
    });

    ical += 'END:VCALENDAR';
    res.send(ical);
  } catch (error) {
    res.status(500).send(`错误: ${error.message}`);
  }
});

// 添加一个API端点列出所有支持的城市
app.get('/cities', (req, res) => {
  const query = req.query.q || '';
  const cities = {};
  
  // 获取所有省份和城市
  Object.entries(areaList.province_list).forEach(([code, name]) => {
    if (name.includes(query)) {
      cities[name] = code.substring(0, 6);
    }
  });
  
  Object.entries(areaList.city_list).forEach(([code, name]) => {
    if (name.includes(query)) {
      cities[name] = code.substring(0, 6);
    }
  });
  
  res.json(cities);
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 