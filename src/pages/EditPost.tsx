import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';

interface Post {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  thread_id: number;
  user_id: string;
  attachments?: Array<{
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
  }>;
  forum_threads?: {
    title: string;
    slug: string;
    forum_categories?: {
      slug: string;
      name: string;
    };
  };
}

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Array<{
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
  }>>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            forum_threads (
              title,
              slug,
              forum_categories (
                slug,
                name
              )
            )
          `)
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Post not found');
        
        // Check if user is the author
        if (data.user_id !== user?.id) {
          throw new Error('You are not authorized to edit this post');
        }

        setPost(data);
        setContent(data.content);
        
        if (data.attachments && Array.isArray(data.attachments)) {
          setAttachments(data.attachments);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Filter for allowed file types and sizes
      const validFiles = files.filter(file => 
        file.size <= 5 * 1024 * 1024 && // 5MB max
        [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'application/zip',
          'application/x-rar-compressed',
          'application/x-7z-compressed'
        ].includes(file.type)
      );
      
      if (validFiles.length < files.length) {
        setError('Some files were not accepted. Please ensure files are images, documents, or archives and under 5MB each.');
      } else if (validFiles.length > 0) {
        setNewFiles(prev => [...prev, ...validFiles]);
      }
    }
  };

  const removeExistingAttachment = (index: number) => {
    const attachment = attachments[index];
    if (attachment) {
      setFilesToRemove(prev => [...prev, attachment.url]);
      setAttachments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadNewFiles = async (threadId: number, userId: string) => {
    if (newFiles.length === 0) return [];
    
    const uploadedAttachments = [];
    
    for (const file of newFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${userId}/${threadId}/${fileName}`;
      
      try {
        // Upload the file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('forum-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('forum-attachments')
          .getPublicUrl(filePath);
        
        uploadedAttachments.push({
          url: publicUrl,
          fileName: file.name,
          mimeType: file.type,
          size: file.size
        });
        
        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }));
        
      } catch (err) {
        console.error(`Error uploading file ${file.name}:`, err);
        // Continue with other files even if one fails
      }
    }
    
    return uploadedAttachments;
  };

  const deleteRemovedFiles = async () => {
    if (filesToRemove.length === 0) return;
    
    // Extract file paths from URLs
    const filePaths = filesToRemove.map(url => {
      const parts = url.split('/');
      return parts.slice(parts.indexOf('forum-attachments') + 1).join('/');
    });
    
    // Delete files from storage
    const { error: deleteError } = await supabase.storage
      .from('forum-attachments')
      .remove(filePaths);
    
    if (deleteError) {
      console.error('Error deleting files:', deleteError);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!post || !user) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // 1. Upload new files
      const uploadedAttachments = await uploadNewFiles(post.thread_id, user.id);
      
      // 2. Combine existing (non-removed) attachments with newly uploaded ones
      const updatedAttachments = [
        ...attachments.filter(a => !filesToRemove.includes(a.url)),
        ...uploadedAttachments
      ];
      
      // 3. Update the post with new content and attachments
      const { error: updateError } = await supabase
        .from('forum_posts')
        .update({
          content,
          attachments: updatedAttachments.length > 0 ? updatedAttachments : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);
      
      if (updateError) throw updateError;
      
      // 4. Delete removed files from storage
      await deleteRemovedFiles();
      
      // 5. Update thread's last_activity_at
      await supabase
        .from('forum_threads')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', post.thread_id);
      
      // 6. Redirect back to the thread
      if (post.forum_threads?.slug) {
        navigate(`/forums/thread/${post.forum_threads.slug}`);
      } else {
        navigate(`/forums/thread/${post.thread_id}`);
      }
      
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post. Please try again.');
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
        <Link 
          to={post?.forum_threads?.slug ? `/forums/thread/${post.forum_threads.slug}` : '/forums'}
          className="inline-flex items-center text-blue-600 hover:underline"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to {post ? 'thread' : 'forums'}
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p>Post not found.</p>
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
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/forums" className="text-blue-600 hover:underline">Forums</Link>
          </li>
          {post.forum_threads?.forum_categories && (
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
                  to={`/forums/category/${post.forum_threads.forum_categories.slug}`} 
                  className="text-blue-600 hover:underline ml-1 md:ml-2 text-sm font-medium"
                >
                  {post.forum_threads.forum_categories.name}
                </Link>
              </div>
            </li>
          )}
          {post.forum_threads?.slug && (
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
                  to={`/forums/thread/${post.forum_threads.slug}`} 
                  className="text-blue-600 hover:underline ml-1 md:ml-2 text-sm font-medium truncate max-w-xs"
                  title={post.forum_threads.title}
                >
                  {post.forum_threads.title}
                </Link>
              </div>
            </li>
          )}
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
                Edit Post
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Post</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Write your post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <span className="mr-2">Supports Markdown formatting</span>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                onClick={() => {
                  window.open('https://www.markdownguide.org/cheat-sheet/', '_blank');
                }}
              >
                Markdown Help
              </button>
            </div>
          </div>
          
          {/* Existing Attachments */}
          {attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Current Attachments
              </h3>
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {attachments.map((file, index) => (
                  <li key={`existing-${index}`} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
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
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 flex-1 w-0 truncate hover:underline"
                      >
                        {file.fileName}
                      </a>
                      <span className="ml-2 text-gray-500 text-xs">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(index)}
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
          
          {/* New Attachments */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {attachments.length > 0 ? 'Add More Attachments' : 'Attachments'}
            </label>
            
            {/* File upload area */}
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
            
            {/* New files to be uploaded */}
            {newFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Files to Upload ({newFiles.length})
                </h3>
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {newFiles.map((file, index) => (
                    <li key={`new-${index}`} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
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
                          onClick={() => removeNewFile(index)}
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
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Last edited: {new Date(post.updated_at || post.created_at).toLocaleString()}
            </div>
            <div className="flex space-x-3">
              <Link
                to={post.forum_threads?.slug ? `/forums/thread/${post.forum_threads.slug}` : '/forums'}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || content.trim() === post.content && 
                  newFiles.length === 0 && filesToRemove.length === 0}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting || (content.trim() === post.content && 
                  newFiles.length === 0 && filesToRemove.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
      </div>
    </AppLayout>
  );
};

export default EditPost;
