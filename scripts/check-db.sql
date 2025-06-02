-- Check if the forum_categories table exists
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns 
WHERE 
    table_name = 'forum_categories';

-- Check all categories
SELECT * FROM forum_categories ORDER BY name;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check 
FROM 
    pg_policies 
WHERE 
    tablename = 'forum_categories';

-- Check if we can insert a test category
WITH inserted AS (
    INSERT INTO forum_categories (name, slug, description, sort_order, created_at)
    VALUES ('Test Category', 'test-category', 'A test category', 99, NOW())
    ON CONFLICT (slug) DO NOTHING
    RETURNING *
)
SELECT * FROM inserted;

-- Clean up test data
DELETE FROM forum_categories WHERE slug = 'test-category';

-- Check if we can create the general discussion category if it doesn't exist
INSERT INTO forum_categories (name, slug, description, sort_order, created_at)
SELECT 'General Discussion', 'general-discussion', 'General discussions about fitness and training', 1, NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM forum_categories WHERE slug = 'general-discussion'
)
RETURNING *;
