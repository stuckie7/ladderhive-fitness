import { supabase } from '@/lib/supabase';

export interface LastPostStat {
  created_at: string;
  thread_id: number;
  id: number;
  profiles: { username: string } | null;
  forum_threads: { title: string; slug: string } | null;
}

export interface CategoryStats {
  threadCount: number;
  postCount: number;
  lastPost: LastPostStat | null;
}

export interface ForumCategory {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface ForumThread {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  user_id: string;
  category_id: number;
}

export interface ForumThreadWithRelations {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  user_id: {
    username: string;
    avatar_url: string | null;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface SearchPostResult {
  id: number;
  content: string;
  created_at: string;
  thread: {
    id: number;
    title: string;
    slug: string;
    category: {
      id: number;
      name: string;
      slug: string;
    };
  };
  user_id: {
    username: string;
    avatar_url: string | null;
  };
}

export interface SearchResults {
  threads: ForumThreadWithRelations[];
  posts: SearchPostResult[];
}

export interface ForumPost {
  id: number;
  thread_id: number;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_solution: boolean;
  parent_post_id: number | null;
  attachments: any[] | null;
}

export interface CreateThreadData {
  title: string;
  content: string;
  category_id: number;
  user_id: string;
  slug?: string;
}

export interface CreatePostData {
  thread_id: number;
  user_id: string;
  content: string;
  parent_post_id?: number | null;
  attachments?: any[] | null;
}

export class ForumService {
  // Search
  static async search(query: string): Promise<SearchResults> {
    console.log('ForumService: Searching for:', query);
    
    try {
      // Search in threads
      const { data: threads, error: threadsError } = await supabase
        .from('forum_threads')
        .select(`
          id,
          title,
          slug,
          created_at,
          updated_at,
          last_activity_at,
          view_count,
          is_pinned,
          is_locked,
          user_id:profiles!forum_threads_user_id_fkey(
            username,
            avatar_url
          ),
          category:forum_categories!forum_threads_category_id_fkey(
            id,
            name,
            slug
          )
        `)
        .textSearch('search_vector', `'${query}':*`, {
          type: 'websearch',
          config: 'english'
        })
        .order('created_at', { ascending: false })
        .limit(10);

      if (threadsError) {
        console.error('ForumService: Error searching threads:', threadsError);
        throw new Error(`Failed to search threads: ${threadsError.message}`);
      }

      // Search in posts
      const { data: posts, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          id,
          content,
          created_at,
          thread:forum_threads!forum_posts_thread_id_fkey(
            id,
            title,
            slug,
            category:forum_categories!forum_threads_category_id_fkey(
              id,
              name,
              slug
            )
          ),
          user_id:profiles!forum_posts_user_id_fkey(
            username,
            avatar_url
          )
        `)
        .textSearch('content', `'${query}':*`, {
          type: 'websearch',
          config: 'english'
        })
        .order('created_at', { ascending: false })
        .limit(10);

      if (postsError) {
        console.error('ForumService: Error searching posts:', postsError);
        throw new Error(`Failed to search posts: ${postsError.message}`);
      }

      // Type assertion to handle the complex nested types
      return {
        threads: (threads || []) as unknown as ForumThreadWithRelations[],
        posts: (posts || []) as unknown as SearchPostResult[]
      };
    } catch (error) {
      console.error('ForumService: Error in search:', error);
      throw error;
    }
  }
  // Categories
  static async getCategories() {
    console.log('ForumService: Fetching categories from database...');
    
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('id, name, description, slug, sort_order, created_at')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('ForumService: Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log('ForumService: Categories fetched successfully:', data);
      return data as ForumCategory[];
    } catch (error) {
      console.error('ForumService: Error in getCategories:', error);
      throw error;
    }
  }

  static async getCategoryBySlug(slug: string) {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('ForumService: Error fetching category by slug:', error);
        throw new Error(`Failed to fetch category: ${error.message}`);
      }
      
      return data as ForumCategory | null;
    } catch (error) {
      console.error('ForumService: Error in getCategoryBySlug:', error);
      throw error;
    }
  }

  // Threads
  static async getThreadsByCategory(categoryId: number) {
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('category_id', categoryId)
        .order('is_pinned', { ascending: false })
        .order('last_activity_at', { ascending: false });

      if (error) {
        console.error('ForumService: Error fetching threads:', error);
        throw new Error(`Failed to fetch threads: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('ForumService: Error in getThreadsByCategory:', error);
      throw error;
    }
  }

  static async getThreadBySlug(slug: string) {
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          ),
          forum_categories (
            id,
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('ForumService: Error fetching thread by slug:', error);
        throw new Error(`Failed to fetch thread: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('ForumService: Error in getThreadBySlug:', error);
      throw error;
    }
  }

  static async getThreadById(id: number) {
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          ),
          forum_categories (
            id,
            name,
            slug
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('ForumService: Error fetching thread by id:', error);
        throw new Error(`Failed to fetch thread: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('ForumService: Error in getThreadById:', error);
      throw error;
    }
  }

  static async createThread(threadData: CreateThreadData) {
    console.log('[ForumService] Starting thread creation with data:', {
      ...threadData,
      content: threadData.content ? `${threadData.content.substring(0, 50)}...` : 'empty'
    });

    try {
      // Validate required fields
      if (!threadData.title?.trim()) {
        throw new Error('Thread title is required');
      }
      if (!threadData.content?.trim()) {
        throw new Error('Thread content is required');
      }
      if (!threadData.user_id) {
        throw new Error('User ID is required');
      }

      // Generate slug if not provided
      if (!threadData.slug) {
        threadData.slug = threadData.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .substring(0, 100)
          .replace(/-+$/, '') +
          '-' + Math.random().toString(36).substring(2, 8);
      }

      console.log('[ForumService] Generated slug:', threadData.slug);

      // Check if category exists
      if (threadData.category_id) {
        console.log('[ForumService] Verifying category exists:', threadData.category_id);
        const { data: category, error: categoryError } = await supabase
          .from('forum_categories')
          .select('id')
          .eq('id', threadData.category_id)
          .single();

        if (categoryError || !category) {
          const errorMsg = `Category with ID ${threadData.category_id} not found`;
          console.error('[ForumService] Category error:', categoryError || errorMsg);
          throw new Error(errorMsg);
        }
      }

      // Create thread
      console.log('[ForumService] Creating thread in database...');
      const threadInsertData = {
        title: threadData.title,
        slug: threadData.slug,
        category_id: threadData.category_id || null,
        user_id: threadData.user_id,
        last_activity_at: new Date().toISOString()
      };
      console.log('[ForumService] Thread insert data:', threadInsertData);

      const { data: thread, error: threadError } = await supabase
        .from('forum_threads')
        .insert([threadInsertData])
        .select()
        .single();

      if (threadError) {
        console.error('[ForumService] Thread creation error:', threadError);
        console.error('Error details:', {
          code: threadError.code,
          details: threadError.details,
          hint: threadError.hint,
          message: threadError.message
        });
        throw new Error(`Failed to create thread: ${threadError.message}`);
      }

      console.log('[ForumService] Thread created successfully:', thread);

      // Create initial post
      console.log('[ForumService] Creating initial post...');
      const postInsertData = {
        thread_id: thread.id,
        user_id: threadData.user_id,
        content: threadData.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      console.log('[ForumService] Post insert data:', {
        ...postInsertData,
        content: postInsertData.content ? `${postInsertData.content.substring(0, 50)}...` : 'empty'
      });

      const { error: postError } = await supabase
        .from('forum_posts')
        .insert([postInsertData]);

      if (postError) {
        console.error('[ForumService] Post creation error:', postError);
        console.error('Error details:', {
          code: postError.code,
          details: postError.details,
          hint: postError.hint,
          message: postError.message
        });
        
        // Attempt to clean up the thread if post creation fails
        console.log('[ForumService] Attempting to clean up thread due to post creation failure...');
        await supabase
          .from('forum_threads')
          .delete()
          .eq('id', thread.id);
          
        throw new Error(`Failed to create post: ${postError.message}`);
      }

      console.log('[ForumService] Thread and post created successfully');
      return thread;
    } catch (error) {
      console.error('ForumService: Error in createThread:', error);
      throw error;
    }
  }

  static async updateThread(id: number, updates: Partial<ForumThread>) {
    const { data, error } = await supabase
      .from('forum_threads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteThread(id: number) {
    const { error } = await supabase
      .from('forum_threads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async incrementThreadViews(threadId: number) {
    const { error } = await supabase.rpc('increment_thread_views', {
      thread_id: threadId
    });

    if (error) throw error;
  }

  // Posts
  static async getPostsByThread(threadId: number) {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        profiles (
          username,
          avatar_url
        )
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async createPost(postData: CreatePostData) {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert([postData])
      .select()
      .single();

    if (error) throw error;

    // Update thread's last activity
    await supabase
      .from('forum_threads')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', postData.thread_id);

    return data;
  }

  static async updatePost(id: number, updates: Partial<ForumPost>) {
    const { data, error } = await supabase
      .from('forum_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deletePost(id: number) {
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async markPostAsSolution(postId: number, threadId: number) {
    // First, remove solution status from other posts in the thread
    await supabase
      .from('forum_posts')
      .update({ is_solution: false })
      .eq('thread_id', threadId);

    // Then mark the specific post as solution
    const { data, error } = await supabase
      .from('forum_posts')
      .update({ is_solution: true })
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Search
  static async searchThreads(query: string, categoryId?: number) {
    let queryBuilder = supabase
      .from('forum_threads')
      .select(`
        *,
        profiles (
          username,
          avatar_url
        ),
        forum_categories (
          name,
          slug
        )
      `)
      .textSearch('title', query);

    if (categoryId) {
      queryBuilder = queryBuilder.eq('category_id', categoryId);
    }

    const { data, error } = await queryBuilder
      .order('last_activity_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  }

  // Thread subscriptions
  static async subscribeToThread(threadId: number, userId: string) {
    const { data, error } = await supabase
      .from('thread_subscriptions')
      .insert([{ thread_id: threadId, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async unsubscribeFromThread(threadId: number, userId: string) {
    const { error } = await supabase
      .from('thread_subscriptions')
      .delete()
      .eq('thread_id', threadId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async isSubscribedToThread(threadId: number, userId: string) {
    const { data, error } = await supabase
      .from('thread_subscriptions')
      .select('*')
      .eq('thread_id', threadId)
      .eq('user_id', userId)
      .single();

    return { isSubscribed: !!data, error };
  }

  // Statistics
  static async getCategoryStats(categoryId: number): Promise<CategoryStats> {
    const { data: threads, error: threadsError } = await supabase
      .from('forum_threads')
      .select('id')
      .eq('category_id', categoryId);

    if (threadsError) throw threadsError;

    const threadIds = threads?.map(t => t.id) || [];
    
    if (threadIds.length === 0) {
      return { threadCount: 0, postCount: 0, lastPost: null };
    }

    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select(`
        id,
        created_at,
        thread_id,
        profiles (username),
        forum_threads (title, slug)
      `)
      .in('thread_id', threadIds)
      .order('created_at', { ascending: false })
      .limit(1);

    if (postsError) throw postsError;

    const { count: postCount, error: countError } = await supabase
      .from('forum_posts')
      .select('*', { count: 'exact', head: true })
      .in('thread_id', threadIds);

    if (countError) throw countError;

    const lastPostData = posts?.[0];

    if (!lastPostData) {
      return {
        threadCount: threads.length,
        postCount: postCount || 0,
        lastPost: null,
      };
    }

    // Supabase returns to-one relationships as an array if the FK is not unique.
    // We manually flatten it to a single object.
    const flattenedPost = {
      ...lastPostData,
      profiles: Array.isArray(lastPostData.profiles) ? lastPostData.profiles[0] : lastPostData.profiles,
      forum_threads: Array.isArray(lastPostData.forum_threads) ? lastPostData.forum_threads[0] : lastPostData.forum_threads,
    };

    return {
      threadCount: threads.length,
      postCount: postCount || 0,
      lastPost: flattenedPost,
    };
  }

  /**
   * Mark a thread as solved or unsolved
   * @param threadId The ID of the thread to update
   * @param isSolved Whether the thread is solved
   * @param solvedByPostId Optional post ID that solved the thread
   */
  static async markThreadAsSolved(threadId: number, isSolved: boolean, solvedByPostId?: number) {
    const updates: {
      is_solved: boolean;
      solved_at?: string;
      solved_by_post_id?: number | null;
      updated_at: string;
    } = {
      is_solved: isSolved,
      updated_at: new Date().toISOString(),
    };

    if (isSolved) {
      updates.solved_at = new Date().toISOString();
      if (solvedByPostId) {
        updates.solved_by_post_id = solvedByPostId;
      }
    } else {
      updates.solved_by_post_id = null;
    }

    const { data, error } = await supabase
      .from('forum_threads')
      .update(updates)
      .eq('id', threadId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get recently solved threads
   * @param limit Maximum number of threads to return (default: 5)
   */
  static async getRecentlySolvedThreads(limit: number = 5): Promise<ForumThreadWithRelations[]> {
    const { data, error } = await supabase
      .from('forum_threads')
      .select(`
        *,
        user:profiles!forum_threads_user_id_fkey(
          username,
          avatar_url
        ),
        category:forum_categories!forum_threads_category_id_fkey(
          id,
          name,
          slug
        )
      `)
      .eq('is_solved', true)
      .order('solved_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map(thread => ({
      ...thread,
      user_id: thread.user,
      category_id: thread.category.id,
    })) || [];
  }

  /**
   * Get the post that solved a thread (if any)
   * @param threadId The ID of the thread
   */
  static async getThreadSolution(threadId: number) {
    const { data, error } = await supabase
      .from('forum_threads')
      .select('solved_by_post_id')
      .eq('id', threadId)
      .single();

    if (error || !data?.solved_by_post_id) return null;

    const { data: post, error: postError } = await supabase
      .from('forum_posts')
      .select('*, user:profiles!forum_posts_user_id_fkey(username, avatar_url)')
      .eq('id', data.solved_by_post_id)
      .single();

    if (postError) return null;
    return post;
  }
}
