
<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> c57dc56863e7fe2b8ce70ae08fe202abf8951f15
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WodList from '@/components/wods/WodList';
import { WodFilterBar } from '@/components/wods/WodFilterBar';
import { useWodBrowser } from '@/hooks/wods/use-wod-browser';
import { Wod } from '@/types/wod';
import { useToast } from '@/components/ui/use-toast';
import { useWodFavorites } from '@/hooks/wods/use-wod-favorites';

const Wods: React.FC = () => {
  // State for favorites
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  
  const {
    wods,
    totalWods,
    isLoading,
    currentPage,
    itemsPerPage,
    filters,
<<<<<<< HEAD
    handleFilterChange,
    handlePageChange,
    activeFilterCount,
    resetFilters
  } = useWodBrowser();
=======
    setFilters,
    resetFilters,
    fetchWods,
    toggleFavorite,
    getFavoriteWods,
  } = useWods();
>>>>>>> c57dc56863e7fe2b8ce70ae08fe202abf8951f15
  
  const { toggleFavorite, isFavorite } = useWodFavorites();
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset filters when switching to favorites tab
    if (value === 'favorites') {
      resetFilters();
    }
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = async (wodId: string) => {
<<<<<<< HEAD
    try {
      const wasFavorite = favorites[wodId] || false;
      await toggleFavorite(wodId);
      
      // Optimistically update the UI
      setFavorites(prev => ({
        ...prev,
        [wodId]: !wasFavorite
      }));
      
      toast({
        title: wasFavorite ? 'Removed from favorites' : 'Added to favorites',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      });
=======
    await toggleFavorite(wodId);
    
    // Refresh the appropriate list after toggling favorite
    if (activeTab === 'favorites') {
      getFavoriteWods();
    } else {
      fetchWods();
>>>>>>> c57dc56863e7fe2b8ce70ae08fe202abf8951f15
    }
  };
  
  // Update favorites when WODs change
  useEffect(() => {
    const updateFavorites = async () => {
      const favs: Record<string, boolean> = {};
      for (const wod of wods) {
        favs[wod.id] = await isFavorite(wod.id);
      }
      setFavorites(favs);
    };
    
    updateFavorites();
  }, [wods, isFavorite]);
  
  // Enhance WODs with favorite status
  const enhancedWods = wods.map(wod => ({
    ...wod,
    is_favorite: favorites[wod.id] || false
  }));
  
  // Filter WODs based on active tab
  const filteredWods = activeTab === 'favorites' 
    ? enhancedWods.filter(wod => wod.is_favorite)
    : enhancedWods;

  // Initial fetch of wods
  useEffect(() => {
    if (activeTab === 'all') {
      fetchWods();
    } else {
      getFavoriteWods();
    }
  }, [activeTab, fetchWods, getFavoriteWods]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <h1 className="text-3xl font-bold gradient-heading mb-6">
          Workouts of the Day
        </h1>
        
<<<<<<< HEAD
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All WODs</TabsTrigger>
              <TabsTrigger value="favorites">My Favorites</TabsTrigger>
            </TabsList>
            
            <div className="text-sm text-muted-foreground">
              {totalWods} {totalWods === 1 ? 'WOD' : 'WODs'} found
            </div>
=======
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <WodFilters 
              filters={filters} 
              onChange={handleFiltersChange} 
            />
>>>>>>> c57dc56863e7fe2b8ce70ae08fe202abf8951f15
          </div>
          
          {/* Filter bar */}
          <WodFilterBar 
            filters={filters}
            onFilterChange={handleFilterChange}
            activeFilterCount={activeFilterCount}
            isSticky={true}
          />
          
          {/* Main content */}
          <div className="space-y-6">
            <TabsContent value="all" className="mt-0">
              <WodList
                wods={filteredWods}
                isLoading={isLoading}
                onToggleFavorite={handleToggleFavorite}
                currentPage={currentPage}
                totalItems={totalWods}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </TabsContent>
            
            <TabsContent value="favorites" className="mt-0">
              <WodList
                wods={filteredWods}
                isLoading={isLoading}
                onToggleFavorite={handleToggleFavorite}
                currentPage={currentPage}
                totalItems={filteredWods.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Wods;
