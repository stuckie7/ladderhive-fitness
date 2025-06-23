import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    profile_photo_url?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  } | null;
  last_post?: {
    created_at: string;
    user_id: string;
    profiles: {
      username: string;
      avatar_url?: string;
      profile_photo_url?: string;
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
  // Route is defined as /forums/:category in App.tsx
const { category: categorySlug } = useParams<{ category: string }>();
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
        
        // Fetch threads with author profiles in a single query
        const { data: threadsData, error: threadsError } = await supabase
          .from('forum_threads')
          .select(`
            *,
            profiles!forum_threads_user_id_fkey (
              username,
              avatar_url,
              profile_photo_url,
              first_name,
              last_name
            )
          `)
          .eq('category_id', categoryData.id)
          .order('is_pinned', { ascending: false })
          .order('last_activity_at', { ascending: false });

        if (threadsError) {
          console.error('Threads fetch error:', threadsError);
          throw threadsError;
        }

        // If no threads, set empty array and return
        if (!threadsData || threadsData.length === 0) {
          setThreads([]);
          setIsLoading(false);
          return;
        }

        console.log('Raw threads data with profiles:', threadsData);

        // Get thread IDs for last post lookup
        const threadIds = threadsData.map(t => t.id);

        // Get last post for each thread
        const { data: lastPostsData, error: lastPostsError } = await supabase
          .from('forum_posts')
          .select(`
            id,
            thread_id,
            created_at,
            user_id,
            profiles!forum_posts_user_id_fkey (
              username,
              avatar_url,
              profile_photo_url
            )
          `)
          .in('thread_id', threadIds)
          .order('created_at', { ascending: false });

        if (lastPostsError) {
          console.error('Error fetching last posts:', lastPostsError);
          throw lastPostsError;
        }

        // Create a map of thread_id to last post
        const lastPostMap = new Map();
        (lastPostsData || []).forEach(post => {
          if (!lastPostMap.has(post.thread_id)) {
            lastPostMap.set(post.thread_id, post);
          }
        });

        // Transform the data to include reply_count and last_post
        const transformedThreads = threadsData.map(thread => {
          const lastPost = lastPostMap.get(thread.id);
          const replyCount = (lastPostsData || []).filter(p => p.thread_id === thread.id).length - 1; // Subtract 1 for the original post
          
          console.log('Processing thread:', {
            threadId: thread.id,
            threadTitle: thread.title,
            lastPost,
            replyCount,
            userId: thread.user_id,
            profilesData: thread.profiles,
            rawThreadData: thread
          });

          return {
            ...thread,
            reply_count: Math.max(0, replyCount),
            last_post: lastPost ? {
              created_at: lastPost.created_at,
              user_id: lastPost.user_id,
              profiles: lastPost.profiles
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

  const getUserDisplayName = (profiles: any) => {
    if (!profiles) return 'Unknown User';
    
    // First try first_name + last_name
    if (profiles.first_name && profiles.last_name) {
      return `${profiles.first_name} ${profiles.last_name}`;
    }
    
    // Then try just first_name
    if (profiles.first_name) {
      return profiles.first_name;
    }
    
    // Then try username
    if (profiles.username) {
      return profiles.username;
    }
    
    // Finally try full_name
    if (profiles.full_name) {
      return profiles.full_name;
    }
    
    return 'Unknown User';
  };

  const getUserInitials = (profiles: any) => {
    if (!profiles) return 'U';
    
    if (profiles.first_name && profiles.last_name) {
      return `${profiles.first_name.charAt(0)}${profiles.last_name.charAt(0)}`.toUpperCase();
    }
    
    if (profiles.first_name) {
      return profiles.first_name.charAt(0).toUpperCase();
    }
    
    if (profiles.username) {
      return profiles.username.charAt(0).toUpperCase();
    }
    
    return 'U';
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
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={thread.profiles?.avatar_url || thread.profiles?.profile_photo_url || ''} 
                          alt={getUserDisplayName(thread.profiles)} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-medium text-sm">
                          {getUserInitials(thread.profiles)}
                        </AvatarFallback>
                      </Avatar>
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
                            {getUserDisplayName(thread.profiles)}
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
                          {getUserDisplayName(thread.last_post.profiles)} replied
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
