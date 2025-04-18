import { MemoryCacheService } from '../memory-cache.service';

describe('MemoryCacheService', () => {
  let cache: MemoryCacheService;

  beforeEach(() => {
    cache = new MemoryCacheService(1); // 使用1秒的TTL便于测试
  });

  afterEach(async () => {
    await cache.clear();
  });

  it('should set and get value', async () => {
    const key = 'test-key';
    const value = { test: 'value' };

    await cache.set(key, value);
    const result = await cache.get(key);

    expect(result).toEqual(value);
  });

  it('should return null for non-existent key', async () => {
    const result = await cache.get('non-existent');
    expect(result).toBeNull();
  });

  it('should delete value', async () => {
    const key = 'test-key';
    const value = { test: 'value' };

    await cache.set(key, value);
    await cache.delete(key);
    const result = await cache.get(key);

    expect(result).toBeNull();
  });

  it('should clear all values', async () => {
    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');

    await cache.clear();
    const result1 = await cache.get('key1');
    const result2 = await cache.get('key2');

    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it('should expire value after TTL', async () => {
    const key = 'test-key';
    const value = { test: 'value' };

    await cache.set(key, value);
    
    // 等待TTL过期
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const result = await cache.get(key);
    expect(result).toBeNull();
  });

  it('should use custom TTL', async () => {
    const key = 'test-key';
    const value = { test: 'value' };

    await cache.set(key, value, { ttl: 2 });
    
    // 等待1秒，应该还在
    await new Promise(resolve => setTimeout(resolve, 1000));
    let result = await cache.get(key);
    expect(result).toEqual(value);
    
    // 再等1秒，应该过期
    await new Promise(resolve => setTimeout(resolve, 1000));
    result = await cache.get(key);
    expect(result).toBeNull();
  });
}); 