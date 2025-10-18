import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/evals - List all evaluations for the current user with pagination
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get total count
    const { count } = await supabase
      .from('evaluations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get paginated data
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const totalPages = Math.ceil((count || 0) / limit)

    const response = NextResponse.json({ 
      data,
      total: count || 0,
      page,
      limit,
      totalPages
    })
    
    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30')
    
    return response
  } catch (error) {
    console.error('List error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
