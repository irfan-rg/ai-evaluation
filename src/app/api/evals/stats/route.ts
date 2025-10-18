import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Evaluation = Database['public']['Tables']['evaluations']['Row']

// GET /api/evals/stats - Get evaluation statistics for the current user
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get days parameter (default 7)
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    // Calculate date threshold
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    // Get all evaluations for the user within the time range
    const { data: evaluations, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', dateThreshold.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate statistics
    const total = evaluations?.length || 0
    
    const avgScore = total > 0
      ? evaluations!.reduce((sum: number, e: Evaluation) => sum + e.score, 0) / total
      : 0

    const avgLatency = total > 0
      ? evaluations!.reduce((sum: number, e: Evaluation) => sum + e.latency_ms, 0) / total
      : 0

    const successRate = total > 0
      ? (evaluations!.filter((e: Evaluation) => e.score >= 70).length / total) * 100
      : 0

    const totalPiiRedacted = evaluations?.reduce(
      (sum: number, e: Evaluation) => sum + (e.pii_tokens_redacted || 0), 
      0
    ) || 0

    // Calculate daily trends
    const dailyMap = new Map<string, { count: number; totalScore: number; totalLatency: number }>()
    
    evaluations?.forEach((e: Evaluation) => {
      const date = new Date(e.created_at).toISOString().split('T')[0]
      const existing = dailyMap.get(date) || { count: 0, totalScore: 0, totalLatency: 0 }
      dailyMap.set(date, {
        count: existing.count + 1,
        totalScore: existing.totalScore + e.score,
        totalLatency: existing.totalLatency + e.latency_ms
      })
    })

    const dailyTrends = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      avgScore: parseFloat((data.totalScore / data.count).toFixed(1)),
      avgLatency: Math.round(data.totalLatency / data.count)
    }))

    // Get score distribution
    const scoreDistribution = {
      excellent: evaluations?.filter((e: Evaluation) => e.score >= 90).length || 0,
      good: evaluations?.filter((e: Evaluation) => e.score >= 70 && e.score < 90).length || 0,
      fair: evaluations?.filter((e: Evaluation) => e.score >= 50 && e.score < 70).length || 0,
      poor: evaluations?.filter((e: Evaluation) => e.score < 50).length || 0,
    }

    const response = NextResponse.json({
      data: {
        totalEvals: total,
        avgScore: parseFloat(avgScore.toFixed(1)),
        avgLatency: parseFloat(avgLatency.toFixed(0)),
        successRate: parseFloat(successRate.toFixed(1)),
        totalPiiRedacted,
        dailyTrends,
        scoreDistribution,
      },
    })
    
    // Add caching headers for stats (can cache longer since they don't change frequently)
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
    
    return response
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
