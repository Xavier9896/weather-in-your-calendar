import { CacheProvider, CacheOptions, CacheItem } from '@/interfaces/cache.interface';

export class MemoryCacheService implements CacheProvider {
  private cache: Map<string, CacheItem<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 3600) { // 默认1小时
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  public async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      await this.delete(key);
      return null;
    }

    return item.data as T;
  }

  public async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl || this.defaultTTL;
    const item: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl * 1000 // 转换为毫秒
    };
    this.cache.set(key, item);
  }

  public async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  public async clear(): Promise<void> {
    this.cache.clear();
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }
} 