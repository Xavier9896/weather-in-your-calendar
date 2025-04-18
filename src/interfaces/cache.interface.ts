export interface CacheOptions {
  ttl?: number; // 缓存过期时间（秒）
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
} 