
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ForumService, SearchPostResult, ForumThreadWithRelations, ForumCategory, LastPostStat, CategoryStats } from '@/services/forumService';
import { ensureForumCategoriesExist } from '@/utils/forumSetup';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, Search as SearchIcon, CheckCircle, Bell, Megaphone, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SearchResults } from '@/components/forum/SearchResults';
import { debounce } from 'lodash';
import AppLayout from '@/components/layout/AppLayout';

interface CategoryWithStats extends ForumCategory {
  threadCount: number;
  postCount: number;
  lastPost: LastPostStat | null;
}

interface ForumThreadWithUser extends ForumThreadWithRelations {
  profiles?: {
    username: string;
    avatar_url: string | null;
  } | null;
  solved_at?: string | null;
}

const Forums: React.FC = () => {
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    threads: ForumThreadWithRelations[];
    posts: SearchPostResult[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [recentlySolvedThreads, setRecentlySolvedThreads] = useState<ForumThreadWithUser[]>([]);
  const [isLoadingSolved, setIsLoadingSolved] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults(null);
        setIsSearching(false);
        return;
      }

      try {
        const results = await ForumService.search(query);
        setSearchResults(results);
      } catch (err) {
        console.error('Error searching:', err);
        setSearchResults({ threads: [], posts: [] });
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      setIsSearching(true);
      setShowSearchResults(true);
      debouncedSearch(query);
    } else {
      setSearchResults(null);
      setShowSearchResults(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setShowSearchResults(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/forums/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  };

  // ------------------------------
  // Data fetching helpers
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await ensureForumCategoriesExist();
      const fetchedCategories: ForumCategory[] = await ForumService.getCategories();
      const categoriesWithStats: CategoryWithStats[] = await Promise.all(
        fetchedCategories.map(async (category) => {
          const stats: CategoryStats = await ForumService.getCategoryStats(category.id);
          return {
            ...category,
            threadCount: stats.threadCount,
            postCount: stats.postCount,
            lastPost: stats.lastPost,
          };
        })
      );
      setCategories(categoriesWithStats);
    } catch (err) {
      console.error('Forums: Error fetching categories:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load forum categories: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRecentlySolved = useCallback(async () => {
    try {
      setIsLoadingSolved(true);
      const threads = await ForumService.getRecentlySolvedThreads(3);
      setRecentlySolvedThreads(threads);
    } catch (error) {
      console.error('Error fetching recently solved threads:', error);
    } finally {
      setIsLoadingSolved(false);
    }
  }, []);

  // ------------------------------
  // Data fetching on mount
  // ------------------------------
  // Load categories and statistics + recently-solved list as soon as the page mounts
  useEffect(() => {
    fetchCategories();
    fetchRecentlySolved();

  }, []);




  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading forums...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="bg-destructive/10 border border-destructive/30 text-destructive-foreground p-4 rounded-lg max-w-md w-full text-center">
          <h3 className="font-medium">Error loading forums</h3>
          <p className="text-sm mt-2">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }



  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
      {/* Header with search */}
      <header className="bg-card border-b border-border py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-4">Community forum</h1>
          <div className="relative max-w-2xl" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  placeholder="Search the community"
                  className="pl-10 pr-10 py-6 text-base bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </form>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery && (
              <div className="absolute z-10 w-full mt-1">
                {isSearching ? (
                  <div className="bg-card border border-border rounded-lg shadow-lg p-4">
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                ) : searchResults ? (
                  <SearchResults
                    threads={searchResults.threads}
                    posts={searchResults.posts}
                    query={searchQuery}
                    onClose={() => setShowSearchResults(false)}
                  />
                ) : null}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Browse By Topic Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Browse By Topic</h2>
            {user && (
              <Button asChild>
                <Link to="/forums/new-thread" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  New Thread
                </Link>
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center col-span-full">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No categories found</h3>
                <p className="mt-1 text-muted-foreground">There are no forum categories available at the moment.</p>
              </div>
            ) : (
              categories.map((category) => (
                <Card key={category.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
                  <div>
                    {/* Use slug if it exists and is not the string 'undefined', otherwise fall back to the numeric id */}
<Link to={`/forums/category/${category.slug && category.slug !== 'undefined' ? category.slug : category.id}`} className="block">
                      <CardHeader className="pb-3">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 bg-primary/10 p-3 rounded-lg">
                            <MessageSquare className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                              {category.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {category.threadCount || 0} {category.threadCount === 1 ? 'thread' : 'threads'}
                            </p>
                            {category.description && (
                              <p className="text-sm text-muted-foreground/90 line-clamp-2">{category.description}</p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </Link>
                  </div>
                  {category.lastPost && (
                    <CardContent className="pt-2 pb-4 text-sm">
                      <div className="border-t border-border pt-3">
                        <p className="font-medium text-muted-foreground mb-1">Last Post</p>
                        {/* Same slug fallback logic for last post link */}
<Link to={`/forums/thread/${(category.lastPost.forum_threads?.slug && category.lastPost.forum_threads?.slug !== 'undefined') ? category.lastPost.forum_threads?.slug : category.lastPost.forum_threads?.id}#post-${category.lastPost.id}`} className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
                          {category.lastPost.forum_threads?.title}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          by {category.lastPost.profiles?.username || 'User'} • {formatDistanceToNow(new Date(category.lastPost.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News Section */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">News & Updates</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                View all
              </Button>
            </div>
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {[
                  {
                    title: 'New Feature: Custom Workout Plans',
                    date: '2 days ago',
                    icon: <Megaphone className="h-5 w-5 text-primary" />
                  },
                  {
                    title: 'Community Guidelines Update',
                    date: '1 week ago',
                    icon: <Bell className="h-5 w-5 text-primary" />
                  },
                  {
                    title: 'Welcome to Our New Forum!',
                    date: '2 weeks ago',
                    icon: <MessageSquare className="h-5 w-5 text-primary" />
                  }
                ].map((item, index) => (
                  <div key={index} className="p-4 hover:bg-accent/10 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Recently Solved Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Recently Solved</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                View all
              </Button>
            </div>
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {isLoadingSolved ? (
                  Array(3).fill(0).map((_, index) => (
                    <div key={index} className="p-4">
                      <div className="animate-pulse flex space-x-3">
                        <div className="rounded-full bg-muted h-5 w-5"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : recentlySolvedThreads.length > 0 ? (
                  recentlySolvedThreads.map((thread) => (
                    <div key={thread.id} className="p-4 hover:bg-accent/10 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-foreground line-clamp-2">
                            <Link to={`/forums/thread/${thread.slug}`} className="hover:text-primary transition-colors">
                              {thread.title}
                            </Link>
                          </h3>
                          <div className="mt-1 flex items-center text-xs text-muted-foreground">
                            <span>By {thread.profiles?.username || 'User'}</span>
                            <span className="mx-1.5">•</span>
                            <span>{formatDistanceToNow(new Date(thread.solved_at || thread.updated_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No solved threads yet. Be the first to mark a solution!
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      </div>
    </AppLayout>
  );
};

export default Forums;
