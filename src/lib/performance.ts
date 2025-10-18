// Performance monitoring utilities
export class PerformanceMonitor {
  private static timers = new Map<string, number>()

  static start(label: string) {
    this.timers.set(label, performance.now())
  }

  static end(label: string): number {
    const start = this.timers.get(label)
    if (!start) return 0
    
    const duration = performance.now() - start
    this.timers.delete(label)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }

  static measure<T>(label: string, fn: () => T): T {
    this.start(label)
    try {
      return fn()
    } finally {
      this.end(label)
    }
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label)
    try {
      return await fn()
    } finally {
      this.end(label)
    }
  }
}

// Quick fetch wrapper with performance monitoring
export async function fetchWithTiming(url: string, options?: RequestInit) {
  return PerformanceMonitor.measureAsync(`API: ${url}`, () => 
    fetch(url, options)
  )
}