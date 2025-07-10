import { supabase } from '@/lib/supabase';

async function checkTestThread() {
  try {
    // Get the most recent thread
    const { data: thread, error } = await supabase
      .from('forum_threads')
      .select(`
        *,
        author:profiles!forum_threads_user_id_fkey (
          id,
          username,
          email,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    console.log('Test Thread Details:', {
      id: thread.id,
      title: thread.title,
      created_at: thread.created_at,
      author: {
        id: thread.author?.id,
        username: thread.author?.username || 'Unknown',
        email: thread.author?.email || 'No email',
        has_avatar: !!thread.author?.avatar_url
      }
    });
  } catch (error) {
    console.error('Error fetching test thread:', error);
  }
}

// Run the function
checkTestThread();
