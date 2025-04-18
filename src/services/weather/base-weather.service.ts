import { WeatherProvider, WeatherForecast, WeatherData, Location } from '@/interfaces/weather.interface';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { CacheProvider } from '@/interfaces/cache.interface';
import { cacheConfig } from '@/config/cache.config';

export abstract class BaseWeatherService implements WeatherProvider {
  protected apiKey: string;
  protected client: AxiosInstance;
  protected baseUrl: string;
  protected cache: CacheProvider;

  constructor(apiKey: string, baseUrl: string, cache: CacheProvider) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.cache = cache;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 5000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
  }

  // 抽象方法，需要子类实现
  protected abstract formatResponse(data: unknown): WeatherForecast;
  protected abstract formatCurrentWeather(data: unknown): WeatherData;

  // 获取天气预报
  public async getForecast(location: Location): Promise<WeatherForecast> {
    return this.getWeatherForecast(location);
  }

  // 获取天气预报（内部实现）
  protected async getWeatherForecast(location: Location): Promise<WeatherForecast> {
    if (!this.client) {
      throw new Error('Weather service client not initialized');
    }

    const cacheKey = this.getForecastCacheKey(location);
    
    // 尝试从缓存获取
    const cached = await this.cache.get<WeatherForecast>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const endpoint = this.getForecastEndpoint(location);
      if (!endpoint) {
        throw new Error('Invalid forecast endpoint');
      }

      const response = await this.client.get(endpoint);
      if (!response?.data) {
        throw new Error('Invalid response from weather service');
      }

      const forecast = this.formatResponse(response.data);
      
      // 缓存结果
      await this.cache.set(cacheKey, forecast, { ttl: cacheConfig.weatherTTL });
      
      return forecast;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to get weather forecast: ${error.response?.data?.message || error.message}`);
      }
      throw new Error(`Failed to get weather forecast: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 获取当前天气
  public async getCurrentWeather(location: Location): Promise<WeatherData> {
    if (!this.client) {
      throw new Error('Weather service client not initialized');
    }

    const cacheKey = this.getCurrentWeatherCacheKey(location);
    
    // 尝试从缓存获取
    const cached = await this.cache.get<WeatherData>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const endpoint = this.getCurrentWeatherEndpoint(location);
      if (!endpoint) {
        throw new Error('Invalid current weather endpoint');
      }

      const response = await this.client.get(endpoint);
      if (!response?.data) {
        throw new Error('Invalid response from weather service');
      }

      const weather = this.formatCurrentWeather(response.data);
      
      // 缓存结果
      await this.cache.set(cacheKey, weather, { ttl: cacheConfig.weatherTTL });
      
      return weather;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to get current weather: ${error.response?.data?.message || error.message}`);
      }
      throw new Error(`Failed to get current weather: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 获取天气预报的API端点
  protected abstract getForecastEndpoint(location: Location): string;

  // 获取当前天气的API端点
  protected abstract getCurrentWeatherEndpoint(location: Location): string;

  // 获取天气预报的缓存键
  protected getForecastCacheKey(location: Location): string {
    return `forecast:${this.getLocationKey(location)}`;
  }

  // 获取当前天气的缓存键
  protected getCurrentWeatherCacheKey(location: Location): string {
    return `current:${this.getLocationKey(location)}`;
  }

  // 通用的位置参数格式化方法
  protected formatLocationParams(location: Location): string {
    const { coordinates } = location;
    if (coordinates) {
      return `lat=${coordinates.lat}&lon=${coordinates.lon}`;
    }
    return `q=${location.name}${location.country ? `,${location.country}` : ''}`;
  }

  private getLocationKey(location: Location): string {
    const { coordinates } = location;
    if (coordinates) {
      return `${coordinates.lat},${coordinates.lon}`;
    }
    return `${location.name}${location.country ? `,${location.country}` : ''}`;
  }
} 