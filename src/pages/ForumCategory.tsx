import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import MessageIcon from '@mui/icons-material/MessageOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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
    avatar_url?: string;
  } | null;
  last_post?: {
    created_at: string;
    user_id: string;
    profiles: {
      username: string;
      avatar_url?: string;
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

        // First, get the thread data
        const { data: threadsData, error: threadsError, count } = await supabase
          .from('forum_threads')
          .select('*', { count: 'exact' })
          .in('id', threadIds.map(t => t.id))
          .order('is_pinned', { ascending: false })
          .order('last_activity_at', { ascending: false });
          
        console.log('Raw threads data:', threadsData);
        
        // If we have threads, fetch the author profiles
        if (threadsData && threadsData.length > 0) {
          const userIds = [...new Set(threadsData.map(thread => thread.user_id))];
          const { data: userProfiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);
            
          console.log('User profiles:', userProfiles);
          
          // Map profiles to threads
          const threadsWithProfiles = threadsData.map(thread => ({
            ...thread,
            author: userProfiles?.find(profile => profile.id === thread.user_id) || null
          }));
          
          console.log('Threads with profiles:', threadsWithProfiles);
          
          // Use the mapped data
          threadsData.length = 0;
          threadsData.push(...threadsWithProfiles);
        }

        // Get last post for each thread
        const { data: lastPostsData, error: lastPostsError } = await supabase
          .from('forum_posts')
          .select(`
            id,
            thread_id,
            created_at,
            user_id,
            author:profiles!forum_posts_user_id_fkey (
              username,
              avatar_url
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
        
        // Debug: Log the first thread's data including author info
        if (threadsData && threadsData.length > 0) {
          const thread = threadsData[0];
          console.log('=== DEBUG: Thread Data ===', {
            threadId: thread.id,
            title: thread.title,
            userId: thread.user_id,
            authorData: thread.author,
            allThreadData: thread
          });
          
          // Log the raw data from Supabase
          console.log('=== DEBUG: Raw Thread Data from Supabase ===', thread);
          
          // Check if user_id exists in profiles
          if (thread.user_id) {
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', thread.user_id)
              .single();
              
            console.log('=== DEBUG: User Profile Data ===', {
              userId: thread.user_id,
              userProfile,
              profileError
            });
          }
        }

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
          
          // Get author data - either from the author field or create a default
          const authorData = thread.author || { username: 'Unknown', avatar_url: null };
          
          console.log('Processing thread:', {
            threadId: thread.id,
            threadTitle: thread.title,
            lastPost,
            replyCount,
            userId: thread.user_id,
            authorData,
            author: authorData.username,
            rawThreadData: thread
          });

          return {
            ...thread,
            reply_count: Math.max(0, replyCount), // Ensure non-negative
            last_post: lastPost ? {
              created_at: lastPost.created_at,
              user_id: lastPost.user_id,
              profiles: {
                username: lastPost.author?.username || 'Unknown',
                avatar_url: lastPost.author?.avatar_url
              }
            } : null,
            // Use the author data
            profiles: {
              username: authorData.username,
              avatar_url: authorData.avatar_url,
              full_name: authorData.full_name
            }
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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error || 'Category not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/forums" className="text-blue-600 hover:underline">Forums</Link>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <div className="flex items-center">
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </div>
              <span className="text-gray-500 ml-1 md:ml-2 text-sm font-medium">{category.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Category Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600">{category.description}</p>
            )}
          </div>
          {user && (
            <Link
              to={`/forums/new-thread/${category?.id}`}
              className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow-md"
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
          <div className="text-sm text-gray-500">
            {threads.length} {threads.length === 1 ? 'thread' : 'threads'}
          </div>
        </div>

        {threads.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            No threads found in this category.
          </div>
        ) : (
          <ul>
            {threads.map(thread => (
              <li key={thread.id} className={`group hover:bg-gray-50 transition-colors duration-150 ${thread.is_pinned ? 'bg-blue-50' : 'bg-white'}`}>
                <Link to={`/forums/thread/${thread.slug || thread.id}`} className="block p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 sm:mr-4">
                      {thread.profiles?.avatar_url ? (
                        <img 
                          src={thread.profiles.avatar_url} 
                          alt={thread.profiles.username || 'User'} 
                          className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-white group-hover:ring-blue-100 transition-all duration-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = `https://ui-avatars.com/api/?name=${thread.profiles?.username || 'U'}&background=random`;
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-medium text-sm shadow-sm ring-2 ring-white group-hover:ring-blue-100 transition-all duration-200">
                          {thread.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="ml-2 sm:ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {thread.title}
                        </h3>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <span className="hidden sm:inline">Started by </span>
                          <span className="font-medium text-gray-700 sm:ml-0.5">
                            {thread.profiles?.username || 'Unknown'}
                          </span>
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span className="whitespace-nowrap">{formatDate(thread.created_at)}</span>
                        <span className="inline-flex items-center text-gray-500 text-sm">
                          <MessageIcon className="mr-1" fontSize="small" />
                          <span>{thread.reply_count}</span>
                        </span>
                        <span className="inline-flex items-center text-gray-500 text-sm">
                          <VisibilityIcon className="mr-1" fontSize="small" />
                          <span>{thread.view_count}</span>
                        </span>
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
