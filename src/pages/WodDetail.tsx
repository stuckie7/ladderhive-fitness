
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import WodDetailComponent from '@/components/wods/WodDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useWods } from '@/hooks/use-wods';

const WodDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedWod, isLoading, fetchWodById, toggleFavorite } = useWods();
  
  useEffect(() => {
    if (id) {
      fetchWodById(id);
    }
  }, [id, fetchWodById]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" className="mb-6" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : selectedWod ? (
          <WodDetailComponent 
            wod={selectedWod} 
            onToggleFavorite={toggleFavorite} 
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Workout Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The workout you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBack}>
              Return to Workouts
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default WodDetail;
