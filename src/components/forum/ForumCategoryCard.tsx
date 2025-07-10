
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ForumCategoryCardProps {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  threadCount?: number;
  lastPost?: {
    created_at: string;
    thread_title?: string;
    username?: string;
  } | null;
}

export const ForumCategoryCard: React.FC<ForumCategoryCardProps> = ({
  id,
  name,
  description,
  slug,
  threadCount = 0,
  lastPost
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link to={`/forums/category/${slug}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
                {description && (
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {threadCount} {threadCount === 1 ? 'thread' : 'threads'}
              </div>
            </div>
          </div>
        </CardHeader>
        
        {lastPost && (
          <CardContent className="pt-0">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>Last post: </span>
              <span className="font-medium ml-1">"{lastPost.thread_title}"</span>
              <span className="mx-1">by</span>
              <span className="font-medium">{lastPost.username}</span>
              <span className="mx-1">•</span>
              <span>{formatDate(lastPost.created_at)}</span>
            </div>
          </CardContent>
        )}
      </Link>
    </Card>
  );
};
