import { CaiyunWeatherService } from '../caiyun.service';
import { MemoryCacheService } from '../../cache/memory-cache.service';
import { Location } from '@/interfaces/weather.interface';
import axios from 'axios';

// 设置环境变量
process.env.CAIYUN_API_KEY = 'test-api-key';
process.env.CAIYUN_BASE_URL = 'https://test-api.caiyunapp.com/v2.5';

// 正确设置 axios 模拟
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// 创建一个模拟的 axios 实例
const mockAxiosInstance = {
  get: jest.fn()
};

// 模拟 axios.create 方法
mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

describe('CaiyunWeatherService', () => {
  let service: CaiyunWeatherService;
  let cache: MemoryCacheService;

  beforeAll(() => {
    // 确保在测试开始前就设置好 axios 模拟
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
  });

  beforeEach(() => {
    // 重置所有模拟
    jest.resetAllMocks();
    // 重新设置 axios.create 的模拟
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
    
    cache = new MemoryCacheService(1);
    service = new CaiyunWeatherService(cache);
  });

  afterEach(async () => {
    await cache.clear();
    jest.clearAllMocks();
  });

  describe('getWeatherForecast', () => {
    it('should return weather forecast for city', async () => {
      const location: Location = {
        city: 'Beijing',
        countryCode: 'CN'
      };

      const mockResponse = {
        data: {
          result: {
            location: {
              name: 'Beijing',
              country: 'China',
              lat: 39.9042,
              lng: 116.4074
            },
            realtime: {
              temperature: 20,
              humidity: 50,
              pressure: 1013,
              wind: {
                speed: 5,
                direction: 90
              },
              description: '晴',
              skycon: 'CLEAR_DAY',
              timestamp: Date.now() / 1000,
              sunrise: Date.now() / 1000,
              sunset: Date.now() / 1000
            },
            daily: [{
              temperature: {
                min: 15,
                max: 25,
                current: 20
              },
              humidity: 50,
              pressure: 1013,
              wind: {
                speed: 5,
                direction: 90
              },
              description: '晴',
              skycon: 'CLEAR_DAY',
              timestamp: Date.now() / 1000,
              sunrise: Date.now() / 1000,
              sunset: Date.now() / 1000
            }]
          }
        }
      };

      // 正确设置 axios 实例的 get 方法模拟
      mockAxiosInstance.get.mockImplementation(() => Promise.resolve(mockResponse));

      const result = await service.getWeatherForecast(location);

      expect(result.location.name).toBe('Beijing');
      expect(result.location.country).toBe('China');
      expect(result.current.temperature.current).toBe(20);
      expect(result.daily).toHaveLength(1);
    });

    it('should use cache for subsequent requests', async () => {
      const location: Location = {
        city: 'Beijing',
        countryCode: 'CN'
      };

      const mockResponse = {
        data: {
          result: {
            location: {
              name: 'Beijing',
              country: 'China',
              lat: 39.9042,
              lng: 116.4074
            },
            realtime: {
              temperature: 20,
              humidity: 50,
              pressure: 1013,
              wind: {
                speed: 5,
                direction: 90
              },
              description: '晴',
              skycon: 'CLEAR_DAY',
              timestamp: Date.now() / 1000,
              sunrise: Date.now() / 1000,
              sunset: Date.now() / 1000
            },
            daily: []
          }
        }
      };

      // 正确设置 axios 实例的 get 方法模拟
      mockAxiosInstance.get.mockImplementation(() => Promise.resolve(mockResponse));

      // 第一次调用
      await service.getWeatherForecast(location);
      // 第二次调用
      await service.getWeatherForecast(location);

      // 应该只调用一次API
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should throw error for invalid location', async () => {
      const location: Location = {};

      await expect(service.getWeatherForecast(location)).rejects.toThrow('Invalid location parameters');
    });

    it('should throw error for invalid response', async () => {
      const location: Location = {
        city: 'Beijing',
        countryCode: 'CN'
      };

      // 模拟无效响应
      mockAxiosInstance.get.mockImplementation(() => Promise.resolve({ data: null }));

      await expect(service.getWeatherForecast(location)).rejects.toThrow('Invalid response from weather service');
    });

    it('should throw error for API error', async () => {
      const location: Location = {
        city: 'Beijing',
        countryCode: 'CN'
      };

      // 模拟 API 错误
      mockAxiosInstance.get.mockImplementation(() => Promise.reject(new Error('API Error')));

      await expect(service.getWeatherForecast(location)).rejects.toThrow('Failed to get weather forecast: API Error');
    });
  });

  describe('getCurrentWeather', () => {
    it('should return current weather for coordinates', async () => {
      const location: Location = {
        latitude: 39.9042,
        longitude: 116.4074
      };

      const mockResponse = {
        data: {
          result: {
            realtime: {
              temperature: 20,
              humidity: 50,
              pressure: 1013,
              wind: {
                speed: 5,
                direction: 90
              },
              description: '晴',
              skycon: 'CLEAR_DAY',
              timestamp: Date.now() / 1000,
              sunrise: Date.now() / 1000,
              sunset: Date.now() / 1000
            }
          }
        }
      };

      // 正确设置 axios 实例的 get 方法模拟
      mockAxiosInstance.get.mockImplementation(() => Promise.resolve(mockResponse));

      const result = await service.getCurrentWeather(location);

      expect(result.temperature.current).toBe(20);
      expect(result.humidity).toBe(50);
      expect(result.wind.speed).toBe(5);
    });

    it('should throw error for invalid location', async () => {
      const location: Location = {};

      await expect(service.getCurrentWeather(location)).rejects.toThrow('Invalid location parameters');
    });

    it('should throw error for invalid response', async () => {
      const location: Location = {
        latitude: 39.9042,
        longitude: 116.4074
      };

      // 模拟无效响应
      mockAxiosInstance.get.mockImplementation(() => Promise.resolve({ data: null }));

      await expect(service.getCurrentWeather(location)).rejects.toThrow('Invalid response from weather service');
    });

    it('should throw error for API error', async () => {
      const location: Location = {
        latitude: 39.9042,
        longitude: 116.4074
      };

      // 模拟 API 错误
      mockAxiosInstance.get.mockImplementation(() => Promise.reject(new Error('API Error')));

      await expect(service.getCurrentWeather(location)).rejects.toThrow('Failed to get current weather: API Error');
    });
  });
}); 