import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Thread {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  last_activity_at: string;
  view_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  user_id: string;
  profiles: {
    username: string;
  } | null;
  last_post?: {
    created_at: string;
    user_id: string;
    profiles: {
      username: string;
    } | null;
  } | null;
}

interface Category {
  id: number;
  name: string;
  description: string | null;
  slug: string;
}

const ForumCategory: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!categorySlug) {
        console.log('No category slug provided in URL');
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching category with slug:', categorySlug);

        // Fetch category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('forum_categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();

        console.log('Category fetch result:', { categoryData, categoryError });

        if (categoryError) {
          console.error('Category fetch error:', categoryError);
          throw categoryError;
        }
        
        if (!categoryData) {
          console.log('No category found with slug:', categorySlug);
          navigate('/forums', { replace: true });
          return;
        }

        console.log('Setting category data:', categoryData);
        setCategory(categoryData);

        console.log('Fetching threads for category ID:', categoryData.id);
        
        // Fetch threads for this category with additional data
        // First, get the thread IDs for this category
        const { data: threadIds, error: threadIdsError } = await supabase
          .from('forum_threads')
          .select('id')
          .eq('category_id', categoryData.id);

        if (threadIdsError) {
          console.error('Error fetching thread IDs:', threadIdsError);
          throw threadIdsError;
        }

        // If no threads, set empty array and return
        if (!threadIds || threadIds.length === 0) {
          setThreads([]);
          setIsLoading(false);
          return;
        }

        // Get thread data with author info
        const { data: threadsData, error: threadsError, count } = await supabase
          .from('forum_threads')
          .select(`
            *,
            author:profiles!user_id (
              username
            )
          `, { count: 'exact' })
          .in('id', threadIds.map(t => t.id))
          .order('is_pinned', { ascending: false })
          .order('last_activity_at', { ascending: false });

        // Get last post for each thread
        const { data: lastPostsData, error: lastPostsError } = await supabase
          .from('forum_posts')
          .select(`
            id,
            thread_id,
            created_at,
            author:profiles!user_id (
              username
            )
          `)
          .in('thread_id', threadIds.map(t => t.id))
          .order('created_at', { ascending: false });

        if (lastPostsError) {
          console.error('Error fetching last posts:', lastPostsError);
          throw lastPostsError;
        }

        console.log('Threads fetch result:', { 
          count,
          threadsData: threadsData?.length,
          threadsError 
        });

        if (threadsError) {
          console.error('Threads fetch error:', threadsError);
          throw threadsError;
        }

        // Create a map of thread_id to last post
        const lastPostMap = new Map();
        (lastPostsData || []).forEach(post => {
          if (!lastPostMap.has(post.thread_id)) {
            lastPostMap.set(post.thread_id, post);
          }
        });

        // Transform the data to include reply_count and last_post
        const transformedThreads = (threadsData || []).map(thread => {
          const lastPost = lastPostMap.get(thread.id);
          const replyCount = (lastPostsData || []).filter(p => p.thread_id === thread.id).length - 1; // Subtract 1 for the original post
          
          console.log('Processing thread:', {
            threadId: thread.id,
            threadTitle: thread.title,
            lastPost,
            replyCount,
            author: thread.author?.username || 'Unknown'
          });

          return {
            ...thread,
            reply_count: Math.max(0, replyCount), // Ensure non-negative
            last_post: lastPost ? {
              created_at: lastPost.created_at,
              user_id: lastPost.user_id,
              profiles: {
                username: lastPost.author?.username || 'Unknown'
              }
            } : null,
            // Ensure profiles is always an object to match the Thread interface
            profiles: thread.author ? {
              username: thread.author.username || 'Unknown'
            } : null
          };
        });

        setThreads(transformedThreads);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [categorySlug, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error || 'Category not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/forums" className="text-blue-600 hover:underline">Forums</Link>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="text-gray-500 ml-1 md:ml-2 text-sm font-medium">{category.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Category Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600">{category.description}</p>
            )}
          </div>
          {user && (
            <Link
              to={`/forums/new-thread/${category?.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              New Thread
            </Link>
          )}
        </div>
      </div>

      {/* Threads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-700">Threads</h2>
          <div className="text-sm text-gray-500">{threads.length} {threads.length === 1 ? 'thread' : 'threads'}</div>
        </div>

        {threads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No threads found in this category. Be the first to start a discussion!
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {threads.map((thread) => (
              <li key={thread.id} className={`hover:bg-gray-50 transition-colors ${thread.is_pinned ? 'bg-blue-50' : ''}`}>
                <Link to={`/forums/thread/${thread.slug || thread.id}`} className="block p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {thread.profiles?.username?.charAt(0) || '?'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        {thread.is_pinned && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                            Pinned
                          </span>
                        )}
                        {thread.is_locked && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                            Locked
                          </span>
                        )}
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {thread.title}
                        </h3>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500">
                        <span>Started by {thread.profiles?.username || 'Unknown'}</span>
                        <span className="mx-1">·</span>
                        <span>{formatDate(thread.created_at)}</span>
                        <span className="mx-1">·</span>
                        <span>{thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}</span>
                        <span className="mx-1">·</span>
                        <span>{thread.view_count} {thread.view_count === 1 ? 'view' : 'views'}</span>
                      </div>
                    </div>
                    {thread.last_post && (
                      <div className="hidden md:flex flex-shrink-0 ml-4 flex-col items-end">
                        <div className="text-sm text-gray-500">
                          {formatDate(thread.last_activity_at)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {thread.last_post.profiles?.username || 'Someone'} replied
                        </div>
                      </div>
                    )}
                    <div className="ml-4 flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ForumCategory;
