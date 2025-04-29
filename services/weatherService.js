import axios from "axios";
import dayjs from "dayjs";
import {
  saveWeatherData,
  getWeatherData,
  saveCityInfo,
  getCityInfo,
} from "../db/database.js";

// 缓存过期时间（毫秒），默认1小时
const CACHE_EXPIRY = parseInt(process.env.CACHE_EXPIRY) || 3600000;

/**
 * 构建天气API请求参数
 * @param {Object} params 请求参数
 * @returns {Object} 处理后的参数
 */
function buildWeatherParams(params) {
  const { areaCode, areaCn, ip, lng, lat } = params;

  // 构建基础参数
  const baseParams = {
    areaCode: "",
    areaCn: "",
    ip: "",
    lng: "",
    lat: "",
  };

  // 优先使用areaCode
  if (areaCode) {
    baseParams.areaCode = areaCode;
  }
  // 其次使用areaCn
  else if (areaCn) {
    baseParams.areaCn = areaCn;
  }
  // 再次使用ip
  else if (ip) {
    baseParams.ip = ip;
  }
  // 最后使用经纬度
  else if (lng && lat) {
    baseParams.lng = lng;
    baseParams.lat = lat;
  }
  // 如果都没有提供，抛出错误
  else {
    throw new Error(
      "必须提供 areaCode、areaCn、ip 中的任意一个，或者同时提供 lng 和 lat",
    );
  }

  return baseParams;
}

/**
 * 从API获取7天天气数据
 * @param {Object} params 请求参数
 * @returns {Promise<Object>} 天气数据
 */
async function fetchWeather7d(params) {
  try {
    const url = "https://getweather.market.alicloudapi.com/lundear/weather7d";
    const requestParams = buildWeatherParams(params);

    const response = await axios.get(url, {
      params: requestParams,
      headers: {
        Authorization: `APPCODE ${process.env.API_APPCODE || "9ad9be8e8fb34dc1a03dee81a2f45a6c"}`,
      },
    });

    if (response.data && response.data.code === 0) {
      return response.data.data;
    } else {
      throw new Error(response.data?.desc || "获取天气数据失败");
    }
  } catch (error) {
    console.error("天气API请求失败:", error.message);
    throw error;
  }
}

/**
 * 从API获取15天天气数据
 * @param {Object} params 请求参数
 * @returns {Promise<Object>} 天气数据
 */
async function fetchWeather15d(params) {
  try {
    const url = "https://getweather.market.alicloudapi.com/lundear/weather15d";
    const requestParams = buildWeatherParams(params);

    const response = await axios.get(url, {
      params: requestParams,
      headers: {
        Authorization: `APPCODE ${process.env.API_APPCODE || "9ad9be8e8fb34dc1a03dee81a2f45a6c"}`,
      },
    });

    if (response.data && response.data.code === 0) {
      return response.data.data;
    } else {
      throw new Error(response.data?.desc || "获取天气数据失败");
    }
  } catch (error) {
    console.error("天气API请求失败:", error.message);
    throw error;
  }
}

/**
 * 合并7天和15天天气数据
 * @param {Object} data7d 7天天气数据
 * @param {Object} data15d 15天天气数据
 * @returns {Object} 合并后的天气数据
 */
function mergeWeatherData(data7d, data15d) {
  // 确保cityInfo从任一数据源获取
  const cityInfo = data7d?.cityInfo || data15d?.cityInfo || {};

  // 创建结果对象
  const result = {
    cityInfo: cityInfo,
    days: [],
  };

  // 处理前7天数据
  if (data7d) {
    // 把d1到d7添加到days数组
    for (let i = 1; i <= 7; i++) {
      const dayKey = `d${i}`;
      if (data7d[dayKey]) {
        result.days.push({
          ...data7d[dayKey],
          date: dayjs()
            .add(i - 1, "day")
            .format("YYYY-MM-DD"),
        });
      }
    }
  }

  // 处理8-15天数据
  if (data15d) {
    // 把d8到d15添加到days数组
    for (let i = 8; i <= 15; i++) {
      const dayKey = `d${i}`;
      if (data15d[dayKey]) {
        result.days.push({
          ...data15d[dayKey],
          date: dayjs()
            .add(i - 1, "day")
            .format("YYYY-MM-DD"),
        });
      }
    }
  }
  return result;
}

/**
 * 获取完整的天气数据，优先使用缓存
 * @param {Object} params 请求参数
 * @returns {Promise<Object>} 处理后的天气数据
 */
async function getFullWeatherData(params) {
  const startDate = dayjs().subtract(15, "day").format("YYYY-MM-DD");
  const endDate = dayjs().add(15, "day").format("YYYY-MM-DD");

  try {
    const cityInfo = await getCityInfo(params.areaCn);
    const dataCache = await getWeatherData(params.areaCn, startDate, endDate);

    const currDateData = dataCache?.find(
      ({ date }) => date === dayjs().format("YYYY-MM-DD"),
    );

    if (
      cityInfo &&
      currDateData &&
      dayjs().subtract(1, "hour").isBefore(currDateData.requestTime)
    ) {
      return {
        cityInfo,
        days: dataCache.map(({ weatherData }) => weatherData),
      };
    }

    // 获取7天和15天天气数据
    console.log(`请求新天气数据: ${params.areaCn}`);
    const [data7d, data15d] = await Promise.all([
      fetchWeather7d(params),
      fetchWeather15d(params),
    ]);

    // 合并数据
    const mergedData = mergeWeatherData(data7d, data15d);

    await saveCityInfo(mergedData.cityInfo);
    // 批量保存天气数据
    await saveWeatherData(params.areaCn, mergedData.days);

    return mergedData;
  } catch (error) {
    console.error(`获取天气数据失败: ${error.message}`);
    throw error;
  }
}

/**
 * 根据参数获取天气数据
 * @param {Object} params 请求参数
 * @returns {Promise<Object>} 处理后的天气数据
 */
async function getWeather(params) {
  return await getFullWeatherData(params);
}

export { getWeather };
