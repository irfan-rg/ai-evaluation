// Simple memory cache for API responses
class MemoryCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()

  set(key: string, data: unknown, ttlMs = 30000) { // 30 second default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
  }

  get(key: string) {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  has(key: string) {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  clear() {
    this.cache.clear()
  }

  // Get all cache keys for prefix clearing
  getKeys(): string[] {
    return Array.from(this.cache.keys())
  }

  // Delete a specific key
  delete(key: string): void {
    this.cache.delete(key)
  }
}

export const apiCache = new MemoryCache()

// Type for cached response
export interface CachedResponse {
  ok: boolean
  json: () => Promise<unknown>
  fromCache: boolean
  status?: number
  statusText?: string
}

// Cached fetch wrapper
export async function cachedFetch(url: string, options?: RequestInit, ttlMs = 30000): Promise<CachedResponse> {
  const cacheKey = `${url}-${JSON.stringify(options)}`
  
  // Return cached response if available
  if (apiCache.has(cacheKey)) {
    return {
      ok: true,
      json: async () => apiCache.get(cacheKey),
      fromCache: true,
      status: 200,
      statusText: 'OK'
    }
  }
  
  // Fetch fresh data
  const response = await fetch(url, options)
  if (response.ok) {
    const data = await response.json()
    apiCache.set(cacheKey, data, ttlMs)
    
    return {
      ok: true,
      json: async () => data,
      fromCache: false,
      status: response.status,
      statusText: response.statusText
    }
  }
  
  // Return error response with consistent interface
  return {
    ok: false,
    json: async () => ({}),
    fromCache: false,
    status: response.status,
    statusText: response.statusText
  }
}

/**
 * Clear specific cache entry or all cache
 * @param url - Optional URL to clear specific cache entry
 */
export function clearCache(url?: string): void {
  if (url) {
    // Clear all entries that start with this URL
    const keys = apiCache.getKeys()
    for (const key of keys) {
      if (key.startsWith(url)) {
        apiCache.delete(key)
      }
    }
  } else {
    apiCache.clear()
  }
}