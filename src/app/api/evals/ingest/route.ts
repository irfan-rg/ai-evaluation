import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/evals/ingest - Create a new evaluation
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      interaction_id,
      prompt,
      response,
      score,
      latency_ms,
      flags,
      pii_tokens_redacted,
    } = body

    // Validate required fields
    if (!interaction_id || !prompt || !response || score === undefined || latency_ms === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: interaction_id, prompt, response, score, latency_ms' },
        { status: 400 }
      )
    }

    // Validate score range
    if (score < 0 || score > 100) {
      return NextResponse.json(
        { error: 'Score must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Validate latency
    if (latency_ms < 0) {
      return NextResponse.json(
        { error: 'latency_ms must be a positive number' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('evaluations')
      .insert({
        user_id: user.id,
        interaction_id,
        prompt,
        response,
        score,
        latency_ms,
        flags,
        pii_tokens_redacted,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: unknown) {
    console.error('Ingest error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
