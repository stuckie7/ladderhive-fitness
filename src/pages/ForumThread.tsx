import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Post {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  is_solution: boolean;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    profile_photo_url?: string | null;
    first_name?: string;
    last_name?: string;
  } | null;
  attachments?: Array<{
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
  }>;
}

interface Thread {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  solved_at: string | null;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    profile_photo_url?: string | null;
    first_name?: string;
    last_name?: string;
  } | null;
  forum_categories: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

const ForumThread: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [isMarkingAsSolved, setIsMarkingAsSolved] = useState<number | null>(null);

  const markAsSolved = async (postId: number, threadId: number) => {
    if (!user) return;
    
    try {
      setIsMarkingAsSolved(postId);
      
      // Mark the post as the solution
      const { error: postError } = await supabase
        .from('forum_posts')
        .update({ is_solution: true })
        .eq('id', postId);
      
      if (postError) throw postError;
      
      // Mark the thread as solved
      const { error: threadError } = await supabase
        .from('forum_threads')
        .update({ 
          is_solved: true,
          solved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', threadId);
      
      if (threadError) throw threadError;
      
      // Update the local state
      setThread(prev => prev ? { ...prev, is_solved: true, solved_at: new Date().toISOString() } : null);
      setPosts(prevPosts => 
        prevPosts.map(post => ({
          ...post,
          is_solution: post.id === postId ? true : post.is_solution
        }))
      );
      
      toast.success('Marked as solved!');
    } catch (error) {
      console.error('Error marking as solved:', error);
      toast.error('Failed to mark as solved. Please try again.');
    } finally {
      setIsMarkingAsSolved(null);
    }
  };

  useEffect(() => {
    const fetchThreadData = async () => {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        setError(null);

        // Fetch thread details with category info and profile
        const { data: threadData, error: threadError } = await supabase
          .from('forum_threads')
          .select(`
            *,
            profiles!forum_threads_user_id_fkey (
              username,
              avatar_url,
              profile_photo_url,
              first_name,
              last_name
            ),
            forum_categories (
              id,
              name,
              slug
            )
          `)
          .or(`id.eq.${slug},slug.eq.${slug}`)
          .single();

        if (threadError || !threadData) {
          throw threadError || new Error('Thread not found');
        }

        setThread(threadData);

        // Increment view count
        await supabase.rpc('increment_thread_views', { thread_id: threadData.id });

        // Fetch posts for this thread with profiles
        const { data: postsData, error: postsError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            profiles!forum_posts_user_id_fkey (
              username,
              avatar_url,
              profile_photo_url,
              first_name,
              last_name
            )
          `)
          .eq('thread_id', threadData.id)
          .order('created_at', { ascending: true });

        if (postsError) throw postsError;

        setPosts(postsData || []);

        // Subscribe to new posts in this thread
        const newSubscription = supabase
          .channel(`public:forum_posts:thread_id=eq.${threadData.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'forum_posts',
              filter: `thread_id=eq.${threadData.id}`
            },
            (payload) => {
              const newPost = payload.new as Post;
              // Fetch the profile for the new post
              const fetchProfile = async () => {
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('username, avatar_url, profile_photo_url, first_name, last_name')
                  .eq('id', newPost.user_id)
                  .single();
                
                setPosts(prevPosts => [
                  ...prevPosts,
                  {
                    ...newPost,
                    profiles: profileData
                  }
                ]);
              };
              
              fetchProfile();
            }
          )
          .subscribe();

        setSubscription(newSubscription);
      } catch (err) {
        console.error('Error fetching thread data:', err);
        setError('Failed to load thread. It may have been deleted or you may not have permission to view it.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreadData();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [slug, subscription]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !thread || !replyContent.trim()) return;

    try {
      setIsSubmitting(true);

      const { data: post, error } = await supabase
        .from('forum_posts')
        .insert([
          {
            thread_id: thread.id,
            user_id: user.id,
            content: replyContent,
            // attachments would be handled here if implemented
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update the thread's last_activity_at
      await supabase
        .from('forum_threads')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', thread.id);

      // Add the new post to the local state
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url, profile_photo_url, first_name, last_name')
        .eq('id', user.id)
        .single();

      setPosts(prevPosts => [
        ...prevPosts,
        {
          ...post,
          profiles: profileData
        }
      ]);

      setReplyContent('');
      
      // Scroll to the new post
      setTimeout(() => {
        const element = document.getElementById(`post-${post.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      console.error('Error submitting reply:', err);
      setError('Failed to submit reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (error || !thread) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error || 'Thread not found'}</p>
        </div>
        <Link to="/forums" className="text-blue-600 hover:underline">
          &larr; Back to forums
        </Link>
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
          <li>
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
              <Link 
                to={`/forums/category/${thread.forum_categories?.slug}`} 
                className="text-blue-600 hover:underline ml-1 md:ml-2 text-sm font-medium"
              >
                {thread.forum_categories?.name || 'Category'}
              </Link>
            </div>
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
              <span className="text-gray-500 ml-1 md:ml-2 text-sm font-medium">
                {thread.title}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Thread Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{thread.title}</h1>
              {thread.is_solved && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Solved
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
              <span>Started by {getUserDisplayName(thread.profiles)}</span>
              <span>·</span>
              <span>{formatDate(thread.created_at)}</span>
              <span>·</span>
              <span>{posts.length} {posts.length === 1 ? 'reply' : 'replies'}</span>
              <span>·</span>
              <span>{thread.view_count} {thread.view_count === 1 ? 'view' : 'views'}</span>
              {thread.is_solved && thread.solved_at && (
                <>
                  <span>·</span>
                  <span className="text-green-600 font-medium">
                    Solved {formatDate(thread.solved_at)}
                  </span>
                </>
              )}
            </div>
          </div>
          {user?.id === thread.user_id && (
            <div className="flex space-x-2">
              <button
                onClick={() => {}}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Edit
              </button>
              <button
                onClick={() => {}}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-6 mb-8">
        {posts.map((post) => (
          <div 
            key={post.id} 
            id={`post-${post.id}`}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={post.profiles?.avatar_url || post.profiles?.profile_photo_url || ''} 
                    alt={getUserDisplayName(post.profiles)} 
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-500">
                    {getUserInitials(post.profiles)}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-2 text-center text-xs font-medium text-gray-500">
                  {getUserDisplayName(post.profiles)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500">
                    {formatDate(post.created_at)}
                    {post.updated_at !== post.created_at && (
                      <span className="ml-2 text-xs text-gray-400">
                        (edited)
                      </span>
                    )}
                  </div>
                  {post.is_solution && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Solution
                    </span>
                  )}
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line">{post.content}</p>
                </div>
                
                {/* Attachments */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {post.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center">
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center"
                          >
                            <svg
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            {attachment.fileName}
                          </a>
                          <span className="ml-2 text-xs text-gray-500">
                            ({(attachment.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {}}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Like
                    </button>
                    <button
                      onClick={() => {
                        const replyInput = document.getElementById('reply-content');
                        if (replyInput) {
                          replyInput.focus();
                          setReplyContent(`@${getUserDisplayName(post.profiles)}, `);
                        }
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Reply
                    </button>
                    {user?.id === post.user_id && (
                      <>
                        <button
                          onClick={() => {}}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {}}
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                  {!thread.is_solved && user?.id === thread.user_id && post.user_id !== user.id && (
                    <button
                      onClick={() => markAsSolved(post.id, thread.id)}
                      disabled={isMarkingAsSolved === post.id}
                      className={`text-sm flex items-center gap-1 ${
                        isMarkingAsSolved === post.id 
                          ? 'text-gray-400' 
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      {isMarkingAsSolved === post.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Marking...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Mark as Solution
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      {user ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Post a reply</h2>
          <form onSubmit={handleReplySubmit}>
            <div className="mb-4">
              <label htmlFor="reply-content" className="sr-only">
                Your reply
              </label>
              <textarea
                id="reply-content"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your reply here..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                {/* File upload button would go here */}
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="-ml-0.5 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Attach files
                </button>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !replyContent.trim()}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting || !replyContent.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-blue-800">
            Please{' '}
            <Link to="/login" className="font-medium text-blue-700 hover:underline">
              sign in
            </Link>{' '}
            to reply to this thread.
          </p>
        </div>
      )}
    </div>
  );
};

export default ForumThread;
