
import React, { useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WodList from '@/components/wods/WodList';
import { WodFilterBar } from '@/components/wods/WodFilterBar';
import { useWodBrowser } from '@/hooks/wods';
import { useWodFavorites } from '@/hooks/wods';
import { useToast } from '@/components/ui/use-toast';

const Wods: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('all');
  const { toast } = useToast();
  
  const {
    wods,
    totalWods,
    isLoading,
    currentPage,
    itemsPerPage,
    filters,
    handleFilterChange,
    handlePageChange,
    activeFilterCount,
    resetFilters
  } = useWodBrowser();
  
  const { toggleFavorite } = useWodFavorites();
  
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
    try {
      await toggleFavorite(wodId);
      
      toast({
        title: 'Favorite status updated',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Filter WODs based on active tab
  const filteredWods = activeTab === 'favorites' 
    ? wods.filter(wod => wod.is_favorite)
    : wods;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <h1 className="text-3xl font-bold gradient-heading mb-6">
          Workouts of the Day
        </h1>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All WODs</TabsTrigger>
              <TabsTrigger value="favorites">My Favorites</TabsTrigger>
            </TabsList>
            
            <div className="text-sm text-muted-foreground">
              {totalWods} {totalWods === 1 ? 'WOD' : 'WODs'} found
            </div>
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
