// 位置信息接口
export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Location {
  name: string;
  country: string;
  coordinates: Coordinates;
}

// 天气数据接口
export interface Temperature {
  min: number;
  max: number;
  current: number;
}

export interface Wind {
  speed: number;
  direction: string;
}

export interface WeatherData {
  date: Date;
  temperature: Temperature;
  humidity: number;
  pressure: number;
  wind: Wind;
  description: string;
  icon: string;
  sunrise: Date;
  sunset: Date;
}

// 天气预报接口
export interface WeatherForecast {
  location: Location;
  current: WeatherData;
  daily: WeatherData[];
}

// 天气服务提供商接口
export interface WeatherProvider {
  getForecast(location: Location): Promise<WeatherForecast>;
  getCurrentWeather(location: Location): Promise<WeatherData>;
}

export interface CityData {
  id: number;
  name: string;
  country: string;
}

export interface WeatherResponse {
  city: CityData;
  list: WeatherData[];
} 