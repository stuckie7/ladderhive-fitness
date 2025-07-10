require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Anon Key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQnACategory() {
  try {
    // First, list all categories to see what we have
    console.log('Fetching all categories...');
    const { data: allCategories, error: categoriesError } = await supabase
      .from('forum_categories')
      .select('*');

    if (categoriesError) throw categoriesError;
    console.log('All categories:', allCategories);

    // Then specifically look for the Q&A category
    console.log('\nSearching for Q&A/Support category...');
    const { data: qnaCategory, error: qnaError } = await supabase
      .from('forum_categories')
      .select('*')
      .or('name.ilike.%Q&A%,name.ilike.%Support%')
      .single();

    if (qnaError) {
      console.error('Error fetching Q&A category:', qnaError);
    } else {
      console.log('Q&A/Support category found:', qnaCategory);
      
      // Check if there are threads in this category
      if (qnaCategory) {
        const { data: threads, error: threadsError } = await supabase
          .from('forum_threads')
          .select('*')
          .eq('category_id', qnaCategory.id);
          
        if (threadsError) {
          console.error('Error fetching threads:', threadsError);
        } else {
          console.log(`\nFound ${threads?.length || 0} threads in Q&A/Support category`);
          console.log('Threads:', threads);
        }
      }
    }
  } catch (error) {
    console.error('Error in checkQnACategory:', error);
  }
}

checkQnACategory();
