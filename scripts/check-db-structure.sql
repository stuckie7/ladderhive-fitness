-- Check if user_roles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_roles'
) AS user_roles_exists;

-- List all tables in the public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies on user_roles if it exists
SELECT * FROM pg_policies 
WHERE tablename = 'user_roles';

-- Check forum tables and their RLS policies
SELECT 
  t.table_name,
  t.table_type,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default,
  (SELECT array_agg(policy_name) 
   FROM pg_policies p 
   WHERE p.tablename = t.table_name) AS policies
FROM 
  information_schema.tables t
LEFT JOIN 
  information_schema.columns c ON t.table_name = c.table_name
WHERE 
  t.table_schema = 'public'
  AND t.table_name IN ('forum_categories', 'forum_threads', 'forum_posts', 'user_roles')
ORDER BY 
  t.table_name, 
  c.ordinal_position;
