import { WeatherProvider, WeatherForecast, WeatherData, Location } from '@/interfaces/weather.interface';
import { BaseWeatherService } from './base-weather.service';
import { caiyunConfig } from '@/config/weather.config';
import { CacheProvider } from '@/interfaces/cache.interface';

export class CaiyunWeatherService extends BaseWeatherService implements WeatherProvider {
  constructor(cache: CacheProvider) {
    super(caiyunConfig.apiKey, caiyunConfig.baseUrl, cache);
  }

  async getForecast(location: Location): Promise<WeatherForecast> {
    return this.getWeatherForecast(location);
  }

  protected getForecastEndpoint(location: Location): string {
    const params = this.formatLocationParams(location);
    return `/weather?${params}&dailysteps=7&hourlysteps=24`;
  }

  protected getCurrentWeatherEndpoint(location: Location): string {
    const params = this.formatLocationParams(location);
    return `/weather?${params}&dailysteps=1&hourlysteps=1`;
  }

  protected formatResponse(data: unknown): WeatherForecast {
    const result = (data as any).result;
    return {
      location: {
        name: result.location.name,
        country: result.location.country,
        coordinates: {
          lat: result.location.lat,
          lon: result.location.lng
        }
      },
      current: this.formatWeatherData(result.realtime),
      daily: result.daily.map((day: any) => this.formatWeatherData(day))
    };
  }

  protected formatCurrentWeather(data: unknown): WeatherData {
    return this.formatWeatherData((data as any).result.realtime);
  }

  private formatWeatherData(data: any): WeatherData {
    return {
      date: new Date(data.timestamp * 1000),
      temperature: {
        min: data.temperature.min || data.temperature,
        max: data.temperature.max || data.temperature,
        current: data.temperature
      },
      humidity: data.humidity,
      pressure: data.pressure,
      wind: {
        speed: data.wind.speed,
        direction: data.wind.direction
      },
      description: data.description,
      icon: this.getWeatherIcon(data.skycon),
      sunrise: new Date(data.sunrise * 1000),
      sunset: new Date(data.sunset * 1000)
    };
  }

  private getWeatherIcon(skycon: string): string {
    const iconMap: { [key: string]: string } = {
      'CLEAR_DAY': '☀️',
      'CLEAR_NIGHT': '🌙',
      'PARTLY_CLOUDY_DAY': '⛅️',
      'PARTLY_CLOUDY_NIGHT': '☁️',
      'CLOUDY': '☁️',
      'LIGHT_RAIN': '🌦',
      'MODERATE_RAIN': '🌧',
      'HEAVY_RAIN': '⛈',
      'STORM_RAIN': '⛈',
      'FOG': '🌫',
      'LIGHT_SNOW': '🌨',
      'MODERATE_SNOW': '🌨',
      'HEAVY_SNOW': '❄️',
      'STORM_SNOW': '❄️',
      'DUST': '💨',
      'SAND': '💨',
      'WIND': '💨'
    };
    return iconMap[skycon] || '❓';
  }
} 