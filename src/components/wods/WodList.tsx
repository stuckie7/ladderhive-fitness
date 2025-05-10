
import React from 'react';
import { Wod } from '@/types/wod';
import WodCard from './WodCard';
import { Skeleton } from '@/components/ui/skeleton';

interface WodListProps {
  wods: Wod[];
  isLoading: boolean;
  onToggleFavorite: (wodId: string) => Promise<void>;
}

const WodList: React.FC<WodListProps> = ({ wods, isLoading, onToggleFavorite }) => {
  // Add logging to debug wod data
  console.log("WODs in WodList:", wods);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 h-64">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex gap-2 mt-auto">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (wods.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No workouts found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or check back later for new workouts.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {wods.map(wod => (
        <WodCard 
          key={wod.id} 
          wod={wod} 
          onToggleFavorite={onToggleFavorite} 
        />
      ))}
    </div>
  );
};

export default WodList;
