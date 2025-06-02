import { supabase } from '@/lib/supabase';

export async function checkForumCategories() {
  console.log('Checking forum categories in the database...');
  
  try {
    const { data: categories, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    console.log('Found categories:', categories);
    return categories || [];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

export async function createGeneralDiscussionCategory() {
  console.log('Creating General Discussion category...');
  
  try {
    const { data, error } = await supabase
      .from('forum_categories')
      .insert([
        { 
          name: 'General Discussion', 
          slug: 'general-discussion', 
          description: 'General discussions about fitness and training',
          sort_order: 1 
        }
      ])
      .select();

    if (error) {
      console.error('Error creating category:', error);
      return null;
    }

    console.log('Created category:', data);
    return data?.[0] || null;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
}
