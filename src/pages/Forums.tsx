import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ForumCategory {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  thread_count?: number;
  last_post?: {
    created_at: string;
    thread_title?: string;
    username?: string;
  } | null;
}

const Forums: React.FC = () => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch categories with thread count and last post info
        const { data, error: fetchError } = await supabase
          .from('forum_categories')
          .select(`
            id,
            name,
            description,
            slug,
            forum_threads:forum_threads(count),
            last_post:forum_threads!forum_threads_pkey(
              created_at,
              title,
              user_id,
              profiles:user_id(username)
            )
          `)
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;

        // Transform the data to match our interface
        const transformedData = (data || []).map(category => {
          const lastPost = category.last_post?.[0];
          const lastPostProfile = Array.isArray(lastPost?.profiles) ? lastPost?.profiles[0] : lastPost?.profiles;
          
          return {
            id: category.id,
            name: category.name,
            description: category.description,
            slug: category.slug,
            thread_count: category.forum_threads?.[0]?.count || 0,
            last_post: lastPost ? {
              created_at: lastPost.created_at,
              thread_title: lastPost.title,
              username: lastPostProfile?.username || 'Unknown'
            } : null
          };
        });

        setCategories(transformedData);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load forum categories. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Forums</h1>
          <p className="mt-1 text-gray-600">Join the conversation with other fitness enthusiasts</p>
        </div>
        {user && (
          <div className="mt-4 md:mt-0">
            <Button asChild>
              <Link to="/forums/new-thread" className="flex items-center gap-2">
                <MessageSquarePlus className="h-4 w-4" />
                New Thread
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        {categories.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No categories found</h3>
            <p className="mt-1 text-gray-500">There are no forum categories available at the moment.</p>
            {user && (
              <div className="mt-6">
                <Button asChild>
                  <Link to="/forums/new-thread">Create your first thread</Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id} className="hover:bg-gray-50 transition-colors">
                <Link to={`/forums/category/${category.slug}`} className="block px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-900">{category.name}</h2>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {category.thread_count} {category.thread_count === 1 ? 'thread' : 'threads'}
                        </span>
                      </div>
                      {category.description && (
                        <p className="mt-1 text-sm text-gray-600">{category.description}</p>
                      )}
                      {category.last_post && (
                        <div className="mt-2 text-xs text-gray-500">
                          Last post: "{category.last_post.thread_title}" by {category.last_post.username} • {formatDate(category.last_post.created_at)}
                        </div>
                      )}
                    </div>
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

export default Forums;
