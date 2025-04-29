
-- This function returns information about a specified table
CREATE OR REPLACE FUNCTION public.get_table_info(table_name TEXT)
RETURNS TABLE (
  total_rows BIGINT,
  column_count INTEGER,
  has_primary_key BOOLEAN,
  last_analyzed TIMESTAMPTZ,
  table_size TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH row_count AS (
    SELECT COUNT(*) AS total
    FROM information_schema.tables t
    LEFT JOIN LATERAL (
      SELECT count(*) as count
      FROM pg_catalog.pg_stat_user_tables
      WHERE relname = table_name
    ) counts ON true
    WHERE t.table_schema = 'public'
    AND t.table_name = table_name
  ),
  columns AS (
    SELECT COUNT(*) AS col_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = table_name
  ),
  pk_check AS (
    SELECT COUNT(*) > 0 AS has_pk
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
    AND table_name = table_name
    AND constraint_type = 'PRIMARY KEY'
  ),
  stats AS (
    SELECT last_analyze, last_autoanalyze
    FROM pg_stat_user_tables
    WHERE relname = table_name
  ),
  size_info AS (
    SELECT pg_size_pretty(pg_total_relation_size(quote_ident('public') || '.' || quote_ident(table_name))) AS size
  )
  SELECT 
    r.total,
    c.col_count,
    p.has_pk,
    COALESCE(s.last_analyze, s.last_autoanalyze),
    sz.size
  FROM row_count r
  CROSS JOIN columns c
  CROSS JOIN pk_check p
  LEFT JOIN stats s ON true
  LEFT JOIN size_info sz ON true;
END;
$$;

COMMENT ON FUNCTION public.get_table_info IS 'Returns metadata about a specified table including row count, column count, and size';
