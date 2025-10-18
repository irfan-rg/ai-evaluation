'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import StatsCards from '@/components/Dashboard/StatsCards'
import TrendChart from '@/components/Dashboard/TrendChart'
import RecentEvals from '@/components/Dashboard/RecentEvals'
import { StatCardSkeletonGrid } from '@/components/Skeletons/StatCardSkeleton'
import { ChartSkeleton } from '@/components/Skeletons/ChartSkeleton'
import { TableSkeleton } from '@/components/Skeletons/TableSkeleton'
import { cachedFetch } from '@/lib/cache'

interface DailyTrend {
  date: string
  count: number
  avgScore: number
  avgLatency: number
}

interface StatsData {
  totalEvals: number
  avgScore: number
  avgLatency: number
  successRate: number
  totalPiiRedacted: number
  dailyTrends: DailyTrend[]
}

interface EvaluationRow {
  id: string
  interaction_id: string
  score: number
  latency_ms: number
  created_at: string
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true) // Start true to prevent flash
  const [stats, setStats] = useState<StatsData | null>(null)
  const [recentEvals, setRecentEvals] = useState<EvaluationRow[]>([])
  const [days, setDays] = useState(7)
  const [progress, setProgress] = useState(0)
  const [fromCache, setFromCache] = useState(false) // Track if data came from cache
  const [isPending, startTransition] = useTransition()
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false) // Track if we've loaded data before
  const previousStatsRef = useRef<StatsData | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Show skeleton only when loading and we don't have any previous data
  const showInitialSkeleton = loading && !stats

  const loadData = useCallback(async () => {
    // For subsequent loads, only show loading if we're changing time range
    const isDataRefresh = hasLoadedOnce && stats
    
    if (!isDataRefresh) {
      setLoading(true)
    }
    
    try {
      // Use cached fetch for faster subsequent loads
      const [statsResponse, evalsResponse] = await Promise.all([
        cachedFetch(`/api/evals/stats?days=${days}`, undefined, 15000), // 15s cache
        cachedFetch('/api/evals?limit=10', undefined, 10000) // 10s cache
      ])
      
      // Track if any data came from cache
      const anyCached = statsResponse.fromCache || evalsResponse.fromCache
      setFromCache(anyCached)
      if (anyCached) {
        setLoading(false) // End loading instantly for cached data
      }
      
      if (statsResponse.ok) {
        const responseData = await statsResponse.json() as { data: StatsData }
        const { data } = responseData
        setStats((current) => {
          previousStatsRef.current = current
          return data
        })
      }

      if (evalsResponse.ok) {
        const responseData = await evalsResponse.json() as { data: EvaluationRow[] }
        const { data } = responseData
        setRecentEvals(data || [])
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      if (!fromCache) setLoading(false) // Only for fresh data
      setHasLoadedOnce(true)
    }
  }, [days, hasLoadedOnce, stats, fromCache])

  useEffect(() => {
    const bootstrap = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      await loadData()
    }

    void bootstrap()
  }, [loadData, router, supabase.auth])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (loading) {
      // Different progress speeds for first vs subsequent loads
      const startProgress = hasLoadedOnce ? 60 : 15
      const progressSpeed = hasLoadedOnce ? 300 : 240
      
      setProgress(startProgress)
      const handle = window.setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 20, 85))
      }, progressSpeed)
      return () => window.clearInterval(handle)
    }

    setProgress(100)
    const timeout = window.setTimeout(() => setProgress(0), 400)
    return () => window.clearTimeout(timeout)
  }, [loading, hasLoadedOnce])

  const filteredTrends = useMemo(() => stats?.dailyTrends ?? [], [stats?.dailyTrends])

  const handleRangeChange = (range: number) => {
    if (days === range) return
    startTransition(() => {
      setDays(range)
    })
  }

  if (showInitialSkeleton) {
    return (
      <div className="flex flex-1 flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="h-10 w-44 animate-pulse rounded-full bg-[#007AFF]/10" />
          <div className="h-5 w-64 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
        </div>
        <StatCardSkeletonGrid count={4} fast={hasLoadedOnce} />
        <ChartSkeleton fast={hasLoadedOnce} />
        <TableSkeleton rows={6} fast={hasLoadedOnce} />
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <AnimatePresence>
        {(loading || isPending || progress > 0) && progress < 100 && (
          <motion.div
            key="progress-bar"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed left-0 top-0 z-30 h-1 bg-gradient-to-r from-[#007AFF] via-[#5856D6] to-[#AF52DE]"
          />
        )}
      </AnimatePresence>


      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-2"
        >
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1C1C1E] dark:text-white">
            Command Center
          </h1>
          <p className="text-sm text-[#8E8E93]">
            Monitor Evaluation Volume, Quality, and Latency in Real Time.
          </p>
        </motion.div>
        <motion.div
          className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        >
          {[7, 14, 30].map((range) => {
            const isActive = days === range
            return (
              <motion.button
                key={`range-${range}`}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleRangeChange(range)}
                className={
                  'relative inline-flex items-center justify-center overflow-hidden rounded-full px-4 py-2 text-sm font-semibold transition-colors'
                }
              >
                <span
                  className={
                    isActive
                      ? 'text-white'
                      : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                  }
                >
                  {range} days
                </span>
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      layoutId="range-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-[#007AFF] shadow-[0_12px_30px_rgba(0,122,255,0.28)]"
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </motion.div>
      </div>

      {stats && (
        <StatsCards stats={stats} previousStats={previousStatsRef.current} />
      )}

      <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
        <TrendChart data={filteredTrends} />
        <RecentEvals evals={recentEvals} />
      </div>
    </div>
  )
}
