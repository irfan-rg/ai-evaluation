export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_configs: {
        Row: {
          id: string
          user_id: string
          run_policy: 'always' | 'sampled'
          sample_rate_pct: number
          obfuscate_pii: boolean
          max_eval_per_day: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          run_policy?: 'always' | 'sampled'
          sample_rate_pct?: number
          obfuscate_pii?: boolean
          max_eval_per_day?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          run_policy?: 'always' | 'sampled'
          sample_rate_pct?: number
          obfuscate_pii?: boolean
          max_eval_per_day?: number
          created_at?: string
          updated_at?: string
        }
      }
      evaluations: {
        Row: {
          id: string
          user_id: string
          interaction_id: string
          prompt: string
          response: string
          score: number
          latency_ms: number
          flags: Json | null
          pii_tokens_redacted: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          interaction_id: string
          prompt: string
          response: string
          score: number
          latency_ms: number
          flags?: Json | null
          pii_tokens_redacted?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          interaction_id?: string
          prompt?: string
          response?: string
          score?: number
          latency_ms?: number
          flags?: Json | null
          pii_tokens_redacted?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
