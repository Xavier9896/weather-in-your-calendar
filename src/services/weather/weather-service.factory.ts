import { WeatherProvider } from '@/interfaces/weather.interface';

export enum WeatherProviderType {
  CAIYUN = 'caiyun'
}

export class WeatherServiceFactory {
  private static instance: WeatherServiceFactory;
  private services: Map<WeatherProviderType, WeatherProvider>;

  private constructor() {
    this.services = new Map();
  }

  public static getInstance(): WeatherServiceFactory {
    if (!WeatherServiceFactory.instance) {
      WeatherServiceFactory.instance = new WeatherServiceFactory();
    }
    return WeatherServiceFactory.instance;
  }

  public registerService(type: WeatherProviderType, service: WeatherProvider): void {
    this.services.set(type, service);
  }

  public getService(type: WeatherProviderType = WeatherProviderType.CAIYUN): WeatherProvider {
    const service = this.services.get(type);
    if (!service) {
      throw new Error(`Weather service provider ${type} not found`);
    }
    return service;
  }

  public getAvailableProviders(): WeatherProviderType[] {
    return Array.from(this.services.keys());
  }
} 