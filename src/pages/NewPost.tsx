import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase'; // Using the same import as the rest of the codebase
import { useAuth } from '../context/AuthContext';

interface Thread {
  id: number;
  title: string;
  slug: string;
  forum_categories?: {
    name: string;
    slug: string;
  } | null;
}

const NewPost: React.FC = () => {
  const { threadSlug } = useParams<{ threadSlug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [isReply, setIsReply] = useState(false);
  
  // Check if this is a reply
  useEffect(() => {
    const replyParam = searchParams.get('reply');
    setIsReply(replyParam === 'true');
  }, [searchParams]);

  // Check authentication and fetch thread details
  useEffect(() => {
    const fetchThread = async () => {
      if (!threadSlug) return;
      
      // Check if user is authenticated
      if (!user) {
        setError('You must be logged in to view this page');
        setIsLoading(false);
        // Optionally redirect to login
        // navigate('/login', { state: { from: location.pathname } });
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // First, check if user has permission to post
        // We'll assume all authenticated users can post by default
        // and let the RLS policies handle any restrictions
        console.log('User authenticated, checking permissions...');
        
        // Fetch thread details
        const { data, error: threadError } = await supabase
          .from('forum_threads')
          .select(`
            *,
            forum_categories (
              name,
              slug
            )
          `)
          .or(`id.eq.${threadSlug},slug.eq.${threadSlug}`)
          .single();
        
        if (threadError) throw threadError;
        if (!data) throw new Error('Thread not found');
        
        setThread(data);
      } catch (err) {
        console.error('Error fetching thread:', err);
        setError('Failed to load thread. It may have been deleted or you may not have permission to view it.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchThread();
  }, [threadSlug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    // Authentication check
    if (!user) {
      setError('You must be logged in to post');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // Thread validation
    if (!thread) {
      setError('Thread information is not available');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if user has permission to post
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', user.id);
        
      if (rolesError) {
        console.error('Error checking user roles:', rolesError);
        // Continue even if we can't check roles, let the server handle permissions
      } else if (userRoles && userRoles.length === 0) {
        setError('You do not have permission to post in this forum');
        setIsSubmitting(false);
        return;
      }
      
      // 1. Upload selected files (if any) to Supabase Storage
      let attachments: Array<{ url: string; fileName: string; mimeType: string; size: number }> = [];
      if (files.length > 0) {
        for (const file of files) {
          const filePath = `${user.id}/${Date.now()}-${file.name}`;
          // Upload the file to the authenticated user's folder in the `forum-attachments` bucket
          const { error: uploadError } = await supabase
            .storage
            .from('forum-attachments')
            .upload(filePath, file, {
              contentType: file.type,
              upsert: false,
            });
          if (uploadError) {
            console.error('File upload failed:', uploadError);
            throw uploadError;
          }
          // Get the public URL so the file can be rendered in the UI later
          const { data: publicUrlData } = supabase
            .storage
            .from('forum-attachments')
            .getPublicUrl(filePath);
          attachments.push({
            url: publicUrlData.publicUrl,
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
          });
        }
      }

      // 2. Insert the post with the attachments JSONB array
      const { data: post, error: postError } = await supabase
        .from('forum_posts')
        .insert([
          {
            thread_id: thread.id,
            user_id: user.id,
            content: content.trim(),
            attachments,
            parent_post_id: isReply ? searchParams.get('parent') || null : null,
          },
        ])
        .select()
        .single();

      if (postError) throw postError;

      // 3. Update thread's last activity
      await supabase
        .from('forum_threads')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', thread.id);
      
      // Redirect to the new post
      navigate(`/forums/thread/${thread.slug || thread.id}#post-${post.id}`, { replace: true });
      
    } catch (err: any) {
      console.error('Error creating post:', err);
      
      // Handle specific error cases
      if (err.code === '42501') {
        setError('You do not have permission to perform this action');
      } else if (err.code === '23503') {
        // Foreign key violation
        if (err.message.includes('user_id')) {
          setError('User not found. Please log in again.');
        } else if (err.message.includes('thread_id')) {
          setError('Invalid thread. Please refresh the page and try again.');
        } else {
          setError('An error occurred. Please check your input and try again.');
        }
      } else if (err.message?.includes('JWT')) {
        setError('Your session has expired. Please log in again.');
        // Redirect to login
        navigate('/login', { state: { from: window.location.pathname } });
      } else {
        setError('Failed to create post. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
        <Link 
          to="/forums" 
          className="inline-flex items-center text-blue-600 hover:underline"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to forums
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/forums" className="text-blue-600 hover:underline">Forums</Link>
          </li>
          {thread.forum_categories && (
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link 
                  to={`/forums/category/${thread.forum_categories.slug}`} 
                  className="text-blue-600 hover:underline ml-1 md:ml-2 text-sm font-medium"
                >
                  {thread.forum_categories.name}
                </Link>
              </div>
            </li>
          )}
          <li>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <Link 
                to={`/forums/thread/${thread.slug || thread.id}`} 
                className="text-blue-600 hover:underline ml-1 md:ml-2 text-sm font-medium truncate max-w-xs"
                title={thread.title}
              >
                {thread.title}
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="text-gray-500 ml-1 md:ml-2 text-sm font-medium">
                {isReply ? 'Post Reply' : 'New Post'}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isReply ? 'Post a Reply' : 'Create a New Post'}
        </h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              {isReply ? 'Your Reply' : 'Your Post'} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={isReply ? 'Write your reply here...' : 'Write your post here...'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <div className="mt-1 text-sm text-gray-500">
              Supports Markdown formatting. <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Markdown Help</a>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                  >
                    <span>Upload files</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF, PDF up to 5MB
                </p>
              </div>
            </div>
            
            {files.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Files to upload:</h4>
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {files.map((file, index) => (
                    <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <svg
                          className="flex-shrink-0 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-2 flex-1 w-0 truncate">
                          {file.name}
                        </span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <Link
              to={thread.slug ? `/forums/thread/${thread.slug}` : '/forums'}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPost;
