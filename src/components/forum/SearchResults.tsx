import { Link } from 'react-router-dom';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { SearchPostResult, ForumThreadWithRelations } from '@/services/forumService';
import { formatDistanceToNow } from 'date-fns';

interface SearchResultsProps {
  threads: ForumThreadWithRelations[];
  posts: SearchPostResult[];
  query: string;
  onClose: () => void;
}

export function SearchResults({ threads, posts, query, onClose }: SearchResultsProps) {
  if (threads.length === 0 && posts.length === 0) {
    return (
      <div className="absolute z-50 mt-2 w-full max-w-2xl bg-card border border-border rounded-lg shadow-lg p-4">
        <p className="text-muted-foreground text-sm">No results found for "{query}"</p>
      </div>
    );
  }

  return (
    <div className="absolute z-50 mt-2 w-full max-w-2xl bg-card border border-border rounded-lg shadow-lg overflow-hidden">
      <div className="max-h-[70vh] overflow-y-auto">
        {threads.length > 0 && (
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">THREADS</h3>
            <div className="space-y-3">
              {threads.map((thread) => (
                <Link
                  key={`thread-${thread.id}`}
                  to={`/forums/thread/${thread.slug}`}
                  onClick={onClose}
                  className="block p-2 rounded-md hover:bg-accent/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {thread.title}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <span>in {thread.category.name}</span>
                        <span className="mx-1.5">•</span>
                        <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {posts.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">POSTS</h3>
            <div className="space-y-3">
              {posts.map((post) => (
                <Link
                  key={`post-${post.id}`}
                  to={`/forums/thread/${post.thread.slug}#post-${post.id}`}
                  onClick={onClose}
                  className="block p-2 rounded-md hover:bg-accent/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {post.thread.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {post.content.replace(/<[^>]*>?/gm, '')}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <span>in {post.thread.category.name}</span>
                        <span className="mx-1.5">•</span>
                        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-border p-2 bg-muted/10">
        <button
          onClick={onClose}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Close search results
        </button>
      </div>
    </div>
  );
}
