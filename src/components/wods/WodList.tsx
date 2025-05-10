
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
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-[260px]">
            <Skeleton className="w-full h-full" />
          </div>
        ))}
      </div>
    );
  }

  if (wods.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No workouts found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
