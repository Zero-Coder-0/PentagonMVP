// src/lib/cache-wrapper.ts
import { unstable_cache } from 'next/cache';

/**
 * Generic cache wrapper for data fetching functions
 * @param fetcher - The async function to cache
 * @param keyParts - Unique cache key identifiers
 * @param options - Revalidation settings
 */
export function cacheData<T, Args extends any[]>(
  fetcher: (...args: Args) => Promise<T>,
  keyParts: string[],
  options: { 
    revalidate?: number | false; 
    tags?: string[] 
  } = {}
) {
  const defaultOptions = {
    revalidate: 300, // 5 minutes default
    tags: ['projects'],
    ...options
  };

  return unstable_cache(
    async (...args: Args) => {
      return await fetcher(...args);
    },
    keyParts,
    defaultOptions
  );
}

/**
 * Shorter TTL for frequently changing data
 */
export function cacheShortTerm<T, Args extends any[]>(
  fetcher: (...args: Args) => Promise<T>,
  keyParts: string[],
  tags: string[] = ['projects']
) {
  return cacheData(fetcher, keyParts, { revalidate: 60, tags });
}

/**
 * Longer TTL for static/master data
 */
export function cacheLongTerm<T, Args extends any[]>(
  fetcher: (...args: Args) => Promise<T>,
  keyParts: string[],
  tags: string[] = ['master-data']
) {
  return cacheData(fetcher, keyParts, { revalidate: 3600, tags });
}
