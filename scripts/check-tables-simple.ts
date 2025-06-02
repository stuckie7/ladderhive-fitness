import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jrwyptpespjvjisrwnbh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd3lwdHBlc3Bqdmppc3J3bmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTQ4MTYsImV4cCI6MjA1OTAzMDgxNn0.Ab2IxEvQekhOKlyjYbBQQjukIsOdghmRkQcmQtZNUWk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    // Try to fetch from user_roles table
    console.log('Checking user_roles table...');
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    if (rolesError) {
      console.error('Error accessing user_roles table:', rolesError);
    } else {
      console.log('user_roles table exists and is accessible');
      console.log('Sample data:', userRoles);
    }

    // Check forum tables
    const forumTables = ['forum_categories', 'forum_threads', 'forum_posts'];
    console.log('\nChecking forum tables...');
    
    for (const table of forumTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`Error accessing ${table}:`, error);
        } else {
          console.log(`${table}: ✅ Exists and accessible`);
          if (data && data.length > 0) {
            console.log(`  Sample data:`, data[0]);
          }
        }
      } catch (err) {
        console.error(`Error checking ${table}:`, err);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkTables();
