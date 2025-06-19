// scripts/test-forum-categories.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Anon Key in ');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testForumCategories() {
  console.log('Testing forum_categories table...');
  
  // 1. Check if table exists
  const { data: tableExists, error: tableError } = await supabase
    .rpc('table_exists', { table_name: 'forum_categories' });
    
  if (tableError) {
    console.error('Error checking if table exists:', tableError);
    return;
  }
  
  if (!tableExists) {
    console.error('Error: forum_categories table does not exist');
    return;
  }
  
  console.log('✅ forum_categories table exists');
  
  // 2. Get table structure
  const { data: columns, error: columnsError } = await supabase
    .rpc('get_table_columns', { 
      table_name: 'forum_categories' 
    });
    
  if (columnsError) {
    console.error('Error getting table columns:', columnsError);
    return;
  }
  
  console.log('\nTable structure:');
  console.table(columns);
  
  // 3. Try to fetch some data
  console.log('\nFetching categories...');
  const { data: categories, error: fetchError } = await supabase
    .from('forum_categories')
    .select('*');
    
  if (fetchError) {
    console.error('Error fetching categories:', fetchError);
    return;
  }
  
  console.log(`\nFound ${categories.length} categories:`);
  console.table(categories);
  
  // 4. Check RLS policies
  console.log('\nChecking RLS policies...');
  const { data: policies, error: policiesError } = await supabase
    .rpc('get_policies', { 
      schema_name: 'public',
      table_name: 'forum_categories' 
    });
    
  if (policiesError) {
    console.error('Error getting policies:', policiesError);
    return;
  }
  
  console.log('\nRLS Policies:');
  console.table(policies);
}

testForumCategories().catch(console.error);
