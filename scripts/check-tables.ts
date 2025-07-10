import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jrwyptpespjvjisrwnbh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd3lwdHBlc3Bqdmppc3J3bmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTQ4MTYsImV4cCI6MjA1OTAzMDgxNn0.Ab2IxEvQekhOKlyjYbBQQjukIsOdghmRkQcmQtZNUWk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    // List all tables in the public schema
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (error) {
      console.error('Error fetching tables:', error);
      return;
    }

    console.log('Tables in public schema:');
    console.table(tables.map(t => ({ name: t.tablename })));

    // Check if user_roles table exists
    const hasUserRoles = tables.some(t => t.tablename === 'user_roles');
    console.log(`\nuser_roles table exists: ${hasUserRoles ? '✅' : '❌'}`);

    // Check forum-related tables
    const forumTables = ['forum_categories', 'forum_threads', 'forum_posts'];
    console.log('\nForum tables status:');
    for (const table of forumTables) {
      const exists = tables.some(t => t.tablename === table);
      console.log(`${table}: ${exists ? '✅' : '❌'}`);
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

checkTables();
