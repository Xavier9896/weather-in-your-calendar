import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ES Module need use fileURLToPath to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataBasePath = path.join(__dirname, '../database.sqlite');

// 创建数据库连接
const db = new Database(dataBasePath, { verbose: console.log });

// 初始化数据库表
db.exec(`
  CREATE TABLE IF NOT EXISTS city_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    areaId TEXT NOT NULL,
    areaCn TEXT NOT NULL,
    areaCode TEXT NOT NULL,
    nationCn TEXT NOT NULL,
    nationEn TEXT NOT NULL,
    cityCn TEXT NOT NULL,
    cityEn TEXT NOT NULL,
    provCn TEXT NOT NULL,
    provEn TEXT NOT NULL,
    areaEn TEXT NOT NULL,
    UNIQUE(areaId)
  );

  CREATE TABLE IF NOT EXISTS weather_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    areaCn TEXT NOT NULL,
    date TEXT NOT NULL,
    weatherData TEXT NOT NULL,
    requestTime INTEGER NOT NULL,
    UNIQUE(areaCn, date)
  );
`);

/**
 * 获取城市信息
 * @param {string} areaCn 区域中文名
 * @returns {Object} 城市信息
 */
function getCityInfo(areaCn) {
  const stmt = db.prepare('SELECT * FROM city_info WHERE areaCn = ?');
  return stmt.get(areaCn);
}

/**
 * 获取指定日期范围的天气数据
 * @param {string} areaCn 区域中文名
 * @param {string} startDate 开始日期
 * @param {string} endDate 结束日期
 * @returns {Array} 天气数据列表
 */
function getWeatherData(areaCn, startDate, endDate) {
  const stmt = db.prepare(`
    SELECT * FROM weather_data 
    WHERE areaCn = ? 
    AND date BETWEEN ? AND ?
    ORDER BY date ASC
  `);
  const rows = stmt.all(areaCn, startDate, endDate);
  return rows.map(row => ({
    ...row,
    weatherData: JSON.parse(row.weatherData)
  }));
}

/**
 * 保存城市信息
 * @param {Object} cityInfo 城市信息
 */
function saveCityInfo(cityInfo) {
  const stmt = db.prepare(`
    INSERT INTO city_info (areaId, areaCn, areaCode, nationCn, nationEn, cityCn, cityEn, provCn, provEn, areaEn)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(areaId) 
    DO UPDATE SET 
      areaCn = excluded.areaCn,
      areaCode = excluded.areaCode,
      nationCn = excluded.nationCn,
      nationEn = excluded.nationEn,
      cityCn = excluded.cityCn,
      cityEn = excluded.cityEn,
      provCn = excluded.provCn,
      provEn = excluded.provEn,
      areaEn = excluded.areaEn
  `);

  stmt.run(
    cityInfo.areaId,
    cityInfo.areaCn,
    cityInfo.areaCode,
    cityInfo.nationCn,
    cityInfo.nationEn,
    cityInfo.cityCn,
    cityInfo.cityEn,
    cityInfo.provCn,
    cityInfo.provEn,
    cityInfo.areaEn
  );
}

/**
 * 批量保存天气数据
 * @param {string} areaCn 区域中文名
 * @param {Array<Object>} weatherDataList 天气数据列表
 * @returns {Object} 保存结果
 */
function saveWeatherData(areaCn, weatherDataList) {
  const requestTime = Date.now();
  const stmt = db.prepare(`
    INSERT INTO weather_data (areaCn, date, weatherData, requestTime)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(areaCn, date) 
    DO UPDATE SET 
      weatherData = excluded.weatherData,
      requestTime = excluded.requestTime
  `);

  const insertMany = db.transaction((dataList) => {
    for (const data of dataList) {
      if (!data.date) {
        console.error('天气数据格式不正确:', { areaCn, data });
        continue;
      }
      const weatherDataStr = JSON.stringify(data);
      stmt.run(areaCn, data.date, weatherDataStr, requestTime);
    }
  });

  insertMany(weatherDataList);
  return { success: true };
}

export { db, saveCityInfo, saveWeatherData, getCityInfo, getWeatherData };
