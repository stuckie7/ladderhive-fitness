import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://jrwyptpespjvjisrwnbh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd3lwdHBlc3Bqdmppc3J3bmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTQ4MTYsImV4cCI6MjA1OTAzMDgxNn0.Ab2IxEvQekhOKlyjYbBQQjukIsOdghmRkQcmQtZNUWk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    console.log('Checking database tables...');
    
    // Check if forum_categories table exists and get its structure
    console.log('\n1. Checking forum_categories table...');
    const { data: categoriesTable, error: categoriesTableError } = await supabase
      .rpc('get_table_definition', { table_name: 'forum_categories' });
    
    if (categoriesTableError) {
      console.error('Error checking forum_categories table:', categoriesTableError);
    } else {
      console.log('forum_categories table structure:', categoriesTable);
    }
    
    // Get all categories
    console.log('\n2. Fetching all categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('forum_categories')
      .select('*');
      
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    } else {
      console.log('All categories:', categories);
    }
    
    // Check RLS policies
    console.log('\n3. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { schema_name: 'public', table_name: 'forum_categories' });
      
    if (policiesError) {
      console.error('Error fetching RLS policies:', policiesError);
    } else {
      console.log('RLS policies for forum_categories:', policies);
    }
    
    // Check if the general-discussion category exists
    console.log('\n4. Checking for general-discussion category...');
    const { data: generalCategory, error: generalCategoryError } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('slug', 'general-discussion')
      .single();
      
    if (generalCategoryError) {
      console.error('Error fetching general-discussion category:', generalCategoryError);
    } else if (generalCategory) {
      console.log('General Discussion category exists:', generalCategory);
    } else {
      console.log('General Discussion category does not exist');
      
      // Attempt to create the category
      console.log('\n5. Attempting to create General Discussion category...');
      const { data: newCategory, error: createError } = await supabase
        .from('forum_categories')
        .insert([
          { 
            name: 'General Discussion', 
            slug: 'general-discussion', 
            description: 'General discussions about fitness and training',
            sort_order: 1,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
        
      if (createError) {
        console.error('Error creating category:', createError);
      } else {
        console.log('Successfully created General Discussion category:', newCategory);
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkDatabase()
  .then(() => {
    console.log('\nDatabase check completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
