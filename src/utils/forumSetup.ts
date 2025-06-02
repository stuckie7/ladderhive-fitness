
import { supabase } from '@/lib/supabase';

export async function ensureForumCategoriesExist() {
  console.log('Checking if forum categories exist...');
  
  try {
    // Check if any categories exist
    const { data: categories, error } = await supabase
      .from('forum_categories')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error checking categories:', error);
      throw error;
    }

    // If no categories exist, create a default one
    if (!categories || categories.length === 0) {
      console.log('No categories found, creating default category...');
      
      const { data: newCategory, error: insertError } = await supabase
        .from('forum_categories')
        .insert([{
          name: 'General Discussion',
          slug: 'general-discussion',
          description: 'General discussions about fitness and health',
          sort_order: 1
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating default category:', insertError);
        throw insertError;
      }

      console.log('Default category created:', newCategory);
      return [newCategory];
    }

    console.log('Categories exist in database');
    return categories;
  } catch (error) {
    console.error('Error in ensureForumCategoriesExist:', error);
    throw error;
  }
}
