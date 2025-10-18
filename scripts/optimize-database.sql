-- Database Performance Optimization for Caliber
-- Run these queries in your Supabase SQL Editor for optimal performance

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Index 1: User ID filtering (most common query pattern)
-- This speeds up all queries that filter by user_id
CREATE INDEX IF NOT EXISTS idx_evaluations_user_id 
ON evaluations(user_id);

-- Index 2: Created At timestamp (for date range queries and ordering)
-- This speeds up stats queries and recent evaluations
CREATE INDEX IF NOT EXISTS idx_evaluations_created_at 
ON evaluations(created_at DESC);

-- Index 3: Composite index for user + date queries (best performance)
-- This is the most efficient for dashboard stats and paginated lists
CREATE INDEX IF NOT EXISTS idx_evaluations_user_date 
ON evaluations(user_id, created_at DESC);

-- Index 4: Score for filtering by performance
-- Useful for success rate calculations and filtering
CREATE INDEX IF NOT EXISTS idx_evaluations_score 
ON evaluations(score);

-- ============================================
-- VERIFY INDEXES
-- ============================================

-- Check all indexes on evaluations table
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'evaluations'
ORDER BY indexname;

-- ============================================
-- PERFORMANCE ANALYSIS
-- ============================================

-- Check table statistics
SELECT 
    relname AS table_name,
    n_live_tup AS row_count,
    n_dead_tup AS dead_rows,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE relname = 'evaluations';

-- ============================================
-- QUERY PERFORMANCE TESTING
-- ============================================

-- Test query performance for dashboard stats
-- Run this to see the execution plan
EXPLAIN ANALYZE
SELECT *
FROM evaluations
WHERE user_id = 'your-user-id-here'
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Test query performance for paginated list
EXPLAIN ANALYZE
SELECT *
FROM evaluations
WHERE user_id = 'your-user-id-here'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- ============================================
-- MAINTENANCE
-- ============================================

-- Vacuum the table to optimize storage
-- (Usually handled automatically by Supabase, but can be run manually)
VACUUM ANALYZE evaluations;

-- ============================================
-- NOTES
-- ============================================

/*
Expected Performance Improvements:
- Dashboard stats query: 50-80% faster
- Paginated list: 60-90% faster
- Recent evaluations: 70-90% faster

Index Size Impact:
- Each index adds ~5-10% to table size
- With 1000 rows: negligible impact
- With 100k+ rows: still very manageable

When to Run:
- Run these indexes ASAP if you have performance issues
- Indexes are created IF NOT EXISTS, so safe to run multiple times
- Best to run during low-traffic periods for large tables

Monitoring:
- Watch query execution times in Supabase dashboard
- Check index usage with pg_stat_user_indexes
- Monitor table bloat with pg_stat_user_tables
*/

-- ============================================
-- OPTIONAL: Row Level Security (RLS) CHECK
-- ============================================

-- Verify RLS is enabled (should already be from setup)
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'evaluations';

-- View current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'evaluations';
