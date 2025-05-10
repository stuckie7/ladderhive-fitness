
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WodList from '@/components/wods/WodList';
import WodFilters from '@/components/wods/WodFilters';
import { useWods } from '@/hooks/use-wods';
import { WodFilters as FiltersType } from '@/types/wod';

const Wods: React.FC = () => {
  const {
    wods,
    isLoading,
    filters,
    setFilters,
    fetchWods,
    toggleFavorite,
    getFavoriteWods,
  } = useWods();
  
  const [activeTab, setActiveTab] = useState('all');
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'favorites') {
      getFavoriteWods();
    } else {
      fetchWods(filters);
    }
  };

  const handleFiltersChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
    if (activeTab === 'all') {
      fetchWods(newFilters);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold gradient-heading mb-6">
          Workouts of the Day
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <WodFilters filters={filters} onChange={handleFiltersChange} />
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full max-w-md mx-auto">
                <TabsTrigger value="all" className="flex-1">All WODs</TabsTrigger>
                <TabsTrigger value="favorites" className="flex-1">Favorites</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                <WodList
                  wods={wods}
                  isLoading={isLoading}
                  onToggleFavorite={toggleFavorite}
                />
              </TabsContent>
              
              <TabsContent value="favorites" className="mt-6">
                <WodList
                  wods={wods}
                  isLoading={isLoading}
                  onToggleFavorite={toggleFavorite}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Wods;
