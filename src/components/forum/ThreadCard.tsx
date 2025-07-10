
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Eye, Pin, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ThreadCardProps {
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
    avatar_url: string | null;
  } | null;
  last_post?: {
    created_at: string;
    user_id: string;
    profiles: {
      username: string;
      avatar_url: string | null;
    } | null;
  } | null;
}

export const ThreadCard: React.FC<ThreadCardProps> = ({
  id,
  title,
  slug,
  created_at,
  last_activity_at,
  view_count,
  reply_count,
  is_pinned,
  is_locked,
  profiles,
  last_post
}) => {
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

  return (
    <Card className={`hover:shadow-sm transition-shadow ${is_pinned ? 'bg-blue-50 border-blue-200' : ''}`}>
      <Link to={`/forums/thread/${slug || id}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-2">
                {is_pinned && (
                  <Badge variant="secondary" className="mr-2">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                {is_locked && (
                  <Badge variant="outline" className="mr-2">
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                  </Badge>
                )}
                <h3 className="font-medium text-gray-900 truncate">{title}</h3>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span>Started by {profiles?.username || 'Unknown'}</span>
                <span className="mx-1">•</span>
                <span>{formatDate(created_at)}</span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{reply_count} {reply_count === 1 ? 'reply' : 'replies'}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{view_count} {view_count === 1 ? 'view' : 'views'}</span>
                </div>
              </div>
            </div>
            
            {last_post && (
              <div className="hidden md:flex flex-col items-end text-sm text-gray-500 ml-4">
                <div>{formatDate(last_activity_at)}</div>
                <div className="text-xs">
                  by {last_post.profiles?.username || 'Someone'}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
