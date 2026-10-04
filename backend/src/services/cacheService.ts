interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs
    });
  }

  geoKey(prefix: string, lat: number, lon: number): string {
    return `${prefix}:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheService = new CacheService();
