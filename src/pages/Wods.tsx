
import React, { useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WodList from '@/components/wods/WodList';
import { WodFilterBar } from '@/components/wods/WodFilterBar';
import { WodListSkeleton } from '@/components/wods/WodCardSkeleton';
import { useWodBrowser } from '@/hooks/wods/use-wod-browser';
import { useFavoritesOptimized } from '@/hooks/wods/use-favorites-optimized';
import { useToast } from '@/components/ui/use-toast';
import { useSearchParams } from 'react-router-dom';

// Constants for tab values and URL params
const TAB_PARAM = 'tab';
const ALL_TAB = 'all';
const FAVORITES_TAB = 'favorites';

const Wods: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get(TAB_PARAM) || ALL_TAB;
  const { toast } = useToast();
  
  // Initialize WOD browser hook
  const {
    wods = [],
    totalWods = 0,
    isLoading,
    currentPage = 0,
    itemsPerPage = 12,
    filters,
    handleFilterChange,
    handlePageChange,
    activeFilterCount,
    resetFilters
  } = useWodBrowser();
  
  // Initialize optimized favorites hook
  const { 
    isFavorite, 
    toggleFavorite, 
    filterFavorites, 
    isLoading: isLoadingFavorites 
  } = useFavoritesOptimized();

  // Handle tab change
  const handleTabChange = (value: string) => {
    // Update URL with the new tab
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set(TAB_PARAM, value);
    setSearchParams(newSearchParams);
    
    // Reset filters when switching to favorites tab
    if (value === FAVORITES_TAB) {
      resetFilters();
    }
  };

  // Handle favorite toggle with optimistic updates
  const handleToggleFavorite = async (wodId: string) => {
    try {
      await toggleFavorite(wodId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive',
      });
    }
  };

  // Memoize filtered WODs to prevent unnecessary re-renders
  const { currentWods, totalItems, isCurrentLoading } = useMemo(() => {
    let filteredWods = [...wods];
    
    // Apply favorites filter if active tab is favorites
    if (activeTab === FAVORITES_TAB) {
      filteredWods = filterFavorites(filteredWods);
    }
    
    return {
      currentWods: filteredWods,
      totalItems: activeTab === FAVORITES_TAB ? filteredWods.length : totalWods,
      isCurrentLoading: isLoading || (activeTab === FAVORITES_TAB && isLoadingFavorites)
    };
  }, [activeTab, wods, totalWods, isLoading, isLoadingFavorites, filterFavorites]);

  // Show skeleton loader when data is loading
  if (isCurrentLoading && currentWods.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
          <WodListSkeleton count={6} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <h1 className="text-3xl font-bold gradient-heading mb-6">
          Workouts of the Day
        </h1>
        
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="space-y-6"
          defaultValue={ALL_TAB}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value={ALL_TAB} className="px-4">All WODs</TabsTrigger>
              <TabsTrigger value={FAVORITES_TAB} className="px-4">
                <span className="flex items-center gap-1">
                  <span>My Favorites</span>
                  {activeTab === FAVORITES_TAB && currentWods.length > 0 && (
                    <span className="text-xs bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center">
                      {currentWods.length}
                    </span>
                  )}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
                </span>
              )}
              <span>
                {totalItems} {totalItems === 1 ? 'WOD' : 'WODs'} found
              </span>
            </div>
          </div>
          
          {/* Filter bar - Only show for non-favorites tab */}
          {activeTab !== FAVORITES_TAB && (
            <WodFilterBar 
              filters={filters}
              onFilterChange={handleFilterChange}
              activeFilterCount={activeFilterCount}
              isSticky={true}
            />
          )}
          
          {/* Main content */}
          <div className="space-y-6">
            <TabsContent value={ALL_TAB} className="mt-0">
              {isCurrentLoading && currentWods.length === 0 ? (
                <WodListSkeleton count={6} />
              ) : (
                <WodList
                  wods={currentWods}
                  isLoading={isCurrentLoading}
                  onToggleFavorite={handleToggleFavorite}
                  currentPage={currentPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  isFavorite={(wodId: string) => isFavorite(wodId)}
                />
              )}
            </TabsContent>
            
            <TabsContent value={FAVORITES_TAB} className="mt-0">
              {isLoadingFavorites ? (
                <WodListSkeleton count={4} />
              ) : currentWods.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No favorite workouts yet</h3>
                  <p className="text-muted-foreground mt-2">
                    Click the heart icon on any WOD to save it here
                  </p>
                </div>
              ) : (
                <WodList
                  wods={currentWods}
                  isLoading={false}
                  onToggleFavorite={handleToggleFavorite}
                  currentPage={0}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={() => {}}
                  isFavorite={isFavorite}
                />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Wods;
