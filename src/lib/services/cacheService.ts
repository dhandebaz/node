import { unstable_cache, revalidateTag } from 'next/cache';

export const cacheService = {
  /**
   * Fetches data using Next.js native unstable_cache.
   * Note: The fetcher function must not use dynamic APIs like cookies() or headers().
   */
  async fetchCached<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = 3600
  ): Promise<T> {
    const cachedFn = unstable_cache(fetcher, [key], {
      revalidate: ttlSeconds,
      tags: [key],
    });
    return cachedFn();
  },

  async del(key: string): Promise<void> {
    try {
      // @ts-ignore
      revalidateTag(key);
    } catch (e) {
      console.error('Cache Revalidate Error (del):', e);
    }
  },
  
  async delPattern(pattern: string): Promise<void> {
    try {
      // Next.js natively doesn't support wildcard tag revalidation by pattern string easily,
      // but revalidateTag by the exact tag works. 
      // @ts-ignore
      revalidateTag(pattern);
    } catch (e) {
      console.error('Cache Revalidate Error (delPattern):', e);
    }
  }
};
