import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ForumService } from '@/services/forumService';
import AppLayout from '@/components/layout/AppLayout';

interface Category {
  id: number;
  name: string;
  slug: string;
}

const NewThread: React.FC = () => {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  // Determine initial loading state based on whether a *valid* category parameter was supplied.
// React-Router may sometimes supply the literal string "undefined" for an optional param that was
// omitted (for example when you navigate to /forums/new-thread). Treat this exactly the same as an
// absent parameter so that we don’t get stuck on the loading spinner.
const rawCategoryParam = categoryId === 'undefined' ? undefined : categoryId;
const [isLoading, setIsLoading] = useState(!!rawCategoryParam);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  useEffect(() => {
    const fetchCategory = async () => {
    // Treat both undefined and the literal string "undefined" as missing.
    if (!rawCategoryParam) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

      try {
        console.log('Fetching category with ID:', categoryId);
        
        // First try to fetch by ID
        const { data, error: fetchError } = await supabase
          .from('forum_categories')
          .select('id, name, slug')
          .or(`id.eq.${rawCategoryParam},slug.eq.${rawCategoryParam}`)
          .single();

        if (fetchError) {
          console.error('Supabase fetch error:', fetchError);
          throw fetchError;
        }
        
        if (!data) {
          console.log('No category found with ID/slug:', categoryId);
          throw new Error('Category not found');
        }

        console.log('Found category:', data);
        setCategory(data);
      } catch (err) {
        console.error('Error in fetchCategory:', err);
        setError('Failed to load category. It may have been deleted or you may not have permission to view it.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [rawCategoryParam]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Filter out any files that are too large (e.g., > 5MB)
      const validFiles = newFiles.filter(file => file.size <= 5 * 1024 * 1024);
      
      if (validFiles.length < newFiles.length) {
        setError('Some files were too large (max 5MB) and were not added.');
      }
      
      setAttachments(prev => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async (threadId: number, userId: string) => {
    if (attachments.length === 0) return [];
    
    const uploadedAttachments = [];
    
    for (const file of attachments) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError(null);
    
    // Validate form
    if (!title.trim()) {
      setError('Please enter a title for your thread');
      return;
    }
    
    if (!content.trim()) {
      setError('Please enter some content for your thread');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a thread');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Starting thread creation process...');
      console.log('User ID:', user.id);
      console.log('Category ID:', category?.id);
      console.log('Title:', title);
      console.log('Content length:', content.length);
      console.log('Attachment count:', attachments.length);

      // Create thread data object
      const threadData = {
        title: title.trim(),
        content: content.trim(),
        category_id: category?.id,
        user_id: user.id
      };

      console.log('Thread data prepared:', {
        ...threadData,
        content: threadData.content.substring(0, 50) + (threadData.content.length > 50 ? '...' : '')
      });

      // Call the forum service to create the thread
      const thread = await ForumService.createThread(threadData);
      console.log('Thread created successfully:', thread);

      // Upload attachments if any
      if (attachments.length > 0) {
        console.log('Uploading attachments...');
        try {
          const uploadedAttachments = await uploadAttachments(thread.id, user.id);
          console.log('Attachments uploaded:', uploadedAttachments);
          
          // Update the first post with attachment references
          if (uploadedAttachments.length > 0) {
            console.log('Updating post with attachment references...');
            const { error: updateError } = await supabase
              .from('forum_posts')
              .update({ attachments: uploadedAttachments })
              .eq('thread_id', thread.id)
              .order('created_at', { ascending: true })
              .limit(1);
              
            if (updateError) {
              console.error('Failed to update post with attachments:', updateError);
              // Don't fail the whole operation for attachment updates
            }
          }
        } catch (uploadError) {
          console.error('Error uploading attachments:', uploadError);
          // Continue even if attachments fail
        }
      }

      console.log('Initial post created');

      // Upload attachments if any
      if (attachments.length > 0) {
        console.log('Uploading attachments:', attachments.length);
        try {
          await uploadAttachments(thread.id, user.id);
          console.log('Attachments uploaded successfully');
        } catch (uploadError) {
          console.error('Error uploading attachments:', uploadError);
          // Don't fail the whole operation if attachments fail
          setError('Thread created, but there was an error uploading some attachments');
        }
      }

      // Redirect to the new thread
      const redirectPath = `/forums/thread/${thread.slug || thread.id}`;
      console.log('Redirecting to:', redirectPath);
      navigate(redirectPath);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('permission denied')) {
          setError('You do not have permission to create threads. Please make sure you are logged in and your account has the necessary permissions.');
        } else if (error.message.includes('duplicate key value violates unique constraint')) {
          setError('A thread with this title already exists. Please choose a different title.');
        } else if (error.message.includes('violates foreign key constraint')) {
          setError('The selected category no longer exists. Please select a different category.');
        } else if (error.message.includes('network')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          setError(`Error: ${error.message}`);
        }
      } else {
        setError('An unknown error occurred while creating the thread. Please try again later.');
      }
      
      // Log the full error for debugging
      console.error('Full error details:', {
        error,
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
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
          {category && (
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
                  to={`/forums/category/${category.slug}`} 
                  className="text-blue-600 hover:underline ml-1 md:ml-2 text-sm font-medium"
                >
                  {category.name}
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
                New Thread
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Create a New Thread{category ? ` in ${category.name}` : ''}
        </h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Thread Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a descriptive title for your thread"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Be clear and descriptive with your title to help others find your thread.
            </p>
          </div>
          
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
                  // Open markdown help modal or show tooltip
                  window.open('https://www.markdownguide.org/cheat-sheet/', '_blank');
                }}
              >
                Markdown Help
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
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
            
            {/* Uploaded files list */}
            {attachments.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Attached Files ({attachments.length})
                </h3>
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {attachments.map((file, index) => (
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
                      <div className="ml-4 flex-shrink-0 flex space-x-2">
                        {uploadProgress[file.name] === 100 ? (
                          <span className="text-green-600">Uploaded</span>
                        ) : uploadProgress[file.name] > 0 ? (
                          <span className="text-blue-600">
                            Uploading... {Math.round(uploadProgress[file.name])}%
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
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
            <div className="flex items-center">
              <input
                id="subscribe"
                name="subscribe"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="subscribe" className="ml-2 block text-sm text-gray-700">
                Subscribe to this thread
              </label>
            </div>
            <div className="flex space-x-3">
              <Link
                to={category ? `/forums/category/${category.slug}` : '/forums'}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting || !title.trim() || !content.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Posting...' : 'Post Thread'}
              </button>
            </div>
          </div>
        </form>
      </div>
      </div>
    </AppLayout>
  );
};

export default NewThread;
