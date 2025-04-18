import dotenv from 'dotenv';

dotenv.config();

export interface CacheConfig {
  defaultTTL: number;
  weatherTTL: number;
  calendarTTL: number;
}

export const cacheConfig: CacheConfig = {
  defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600', 10), // 默认1小时
  weatherTTL: 60 * 60,
  calendarTTL: 24 * 60 * 60,
}; 