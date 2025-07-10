// @ts-check
import { createClient } from '@supabase/supabase-js';

// These should match your .env.local file
const SUPABASE_URL = 'https://jrwyptpespjvjisrwnbh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd3lwdHBlc3Bqdmppc3J3bmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTQ4MTYsImV4cCI6MjA1OTAzMDgxNn0.Ab2IxEvQekhOKlyjYbBQQjukIsOdghmRkQcmQtZNUWk';

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    console.log('Fetching categories...');
    const { data: categories, error: catError } = await supabase
      .from('forum_categories')
      .select('*')
      .order('name');

    if (catError) throw catError;

    console.log('\n=== Categories ===');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (ID: ${cat.id}, Slug: ${cat.slug})`);
    });

    // Check Q&A/Support category
    const qnaCategory = categories.find(cat => 
      cat.name.includes('Q&A') || 
      cat.name.includes('Support')
    );

    if (qnaCategory) {
      console.log('\n=== Q&A/Support Category ===');
      console.log(JSON.stringify(qnaCategory, null, 2));
      
      // Get threads in this category
      const { data: threads, error: threadError } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('category_id', qnaCategory.id);
      
      if (threadError) throw threadError;
      
      console.log(`\nFound ${threads.length} threads in this category`);
      threads.forEach((thread, i) => {
        console.log(`\nThread ${i + 1}: ${thread.title}`);
        console.log(`ID: ${thread.id}, Created: ${new Date(thread.created_at).toLocaleString()}`);
      });
    } else {
      console.log('\nNo Q&A/Support category found');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
