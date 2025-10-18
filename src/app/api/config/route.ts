import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('user_configs')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return default values if no config exists
    const config = data || {
      run_policy: 'always',
      sample_rate_pct: 10,
      obfuscate_pii: false,
      max_eval_per_day: 100,
    }

    return NextResponse.json({ data: config })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { run_policy, sample_rate_pct, obfuscate_pii, max_eval_per_day } = body

    // Validation
    if (run_policy && !['always', 'sampled'].includes(run_policy)) {
      return NextResponse.json(
        { error: 'Invalid run_policy. Must be "always" or "sampled"' },
        { status: 400 }
      )
    }

    if (sample_rate_pct !== undefined && (sample_rate_pct < 0 || sample_rate_pct > 100)) {
      return NextResponse.json(
        { error: 'sample_rate_pct must be between 0 and 100' },
        { status: 400 }
      )
    }

    if (max_eval_per_day !== undefined && max_eval_per_day < 1) {
      return NextResponse.json(
        { error: 'max_eval_per_day must be at least 1' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('user_configs')
      .upsert({
        user_id: user.id,
        run_policy: run_policy || 'always',
        sample_rate_pct: sample_rate_pct ?? 10,
        obfuscate_pii: obfuscate_pii ?? false,
        max_eval_per_day: max_eval_per_day ?? 100,
        updated_at: new Date().toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
