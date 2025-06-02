
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ForumService } from '@/services/forumService';
import { ensureForumCategoriesExist } from '@/utils/forumSetup';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, MessageSquarePlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ForumCategoryCard } from '@/components/forum/ForumCategoryCard';

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
        
        console.log('Forums: Starting to fetch categories...');
        
        // Ensure at least one category exists
        await ensureForumCategoriesExist();
        
        const data = await ForumService.getCategories();
        console.log('Forums: Categories fetched successfully:', data);
        
        const transformedData = data.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
          slug: category.slug,
          thread_count: 0,
          last_post: null
        }));

        setCategories(transformedData);
      } catch (err) {
        console.error('Forums: Error fetching categories:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Failed to load forum categories: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
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

      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
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
          categories.map((category) => (
            <ForumCategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              description={category.description}
              slug={category.slug}
              threadCount={category.thread_count}
              lastPost={category.last_post}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Forums;
