import dotenv from 'dotenv';

dotenv.config();

export interface WeatherServiceConfig {
  apiKey: string;
  baseUrl: string;
}

export const caiyunConfig: WeatherServiceConfig = {
  apiKey: process.env.CAIYUN_API_KEY || '',
  baseUrl: process.env.CAIYUN_BASE_URL || 'https://api.caiyunapp.com/v2.5',
}; 