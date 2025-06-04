
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageSquare, Edit, Trash2, CheckCircle } from 'lucide-react';

interface PostProps {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  is_solution: boolean;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
  attachments?: Array<{
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
  }>;
  currentUserId?: string;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMarkAsSolution?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
  likeCount?: number;
}

export const Post: React.FC<PostProps> = ({
  id,
  content,
  created_at,
  updated_at,
  is_solution,
  user_id,
  profiles,
  attachments,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onMarkAsSolution,
  onLike,
  isLiked = false,
  likeCount = 0
}) => {
  const isOwner = currentUserId === user_id;
  const isEdited = updated_at !== created_at;

  const getUserDisplayName = (profiles: any) => {
    if (!profiles) return 'Unknown User';
    
    if (profiles.first_name && profiles.last_name) {
      return `${profiles.first_name} ${profiles.last_name}`;
    }
    
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
    
    if (profiles.username) {
      return profiles.username.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div id={`post-${id}`} className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={profiles?.avatar_url || profiles?.profile_photo_url || ''} 
              alt={getUserDisplayName(profiles)} 
            />
            <AvatarFallback className="bg-gray-200 text-gray-500">
              {getUserInitials(profiles)}
            </AvatarFallback>
          </Avatar>
          <div className="mt-2 text-center text-xs font-medium text-gray-500">
            {getUserDisplayName(profiles)}
          </div>
        </div>

        {/* Post Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{formatDistanceToNow(new Date(created_at), { addSuffix: true })}</span>
              {isEdited && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>
            {is_solution && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Solution
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-4">
            <p className="whitespace-pre-line text-gray-900">{content}</p>
          </div>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 rounded border">
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center flex-1"
                    >
                      <svg
                        className="h-4 w-4 mr-2 text-gray-400"
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
                    <span className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLike}
                className={`flex items-center space-x-1 ${isLiked ? 'text-red-600' : 'text-gray-500'}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount > 0 && likeCount}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onReply}
                className="flex items-center space-x-1 text-gray-500"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Reply</span>
              </Button>

              {isOwner && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className="flex items-center space-x-1 text-gray-500"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="flex items-center space-x-1 text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                </>
              )}
            </div>

            {onMarkAsSolution && !isOwner && !is_solution && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAsSolution}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Mark as Solution
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
