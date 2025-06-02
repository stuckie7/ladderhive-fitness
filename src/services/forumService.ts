import { supabase } from '@/lib/supabase';

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
  static async getCategoryStats(categoryId: number) {
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
        forum_threads (title)
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

    return {
      threadCount: threads.length,
      postCount: postCount || 0,
      lastPost: posts?.[0] || null
    };
  }
}
