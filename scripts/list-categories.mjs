import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseKey);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Fetching categories...');
    const { data: categories, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }

    console.log('\nFound categories:');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (ID: ${cat.id}, Slug: ${cat.slug})`);
    });

    // Check if Q&A/Support exists
    const qna = categories.find(cat => 
      cat.name.toLowerCase().includes('q&a') || 
      cat.name.toLowerCase().includes('support')
    );

    if (qna) {
      console.log('\nQ&A/Support Category Details:');
      console.log(JSON.stringify(qna, null, 2));
      
      // Check threads in this category
      const { data: threads } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('category_id', qna.id);
      
      console.log(`\nFound ${threads?.length || 0} threads in this category`);
      if (threads?.length > 0) {
        console.log('Threads:', JSON.stringify(threads, null, 2));
      }
    } else {
      console.log('\nNo Q&A/Support category found');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

main().catch(console.error);
