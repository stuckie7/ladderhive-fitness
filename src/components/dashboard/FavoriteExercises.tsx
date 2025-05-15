
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSuggestedExercises } from '@/hooks/use-suggested-exercises';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Dumbbell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FavoriteExercises = () => {
  const { suggestedExercises, isLoading } = useSuggestedExercises();
  const navigate = useNavigate();
  
  const handleViewDetails = (exerciseId: string | number) => {
    navigate(`/exercises/${exerciseId}`);
  };
  
  // Show limited number of exercises on dashboard
  const displayExercises = suggestedExercises.slice(0, 4);
  
  if (isLoading) {
    return (
      <Card className="col-span-12 lg:col-span-6 xl:col-span-7">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Suggested Exercises</CardTitle>
          <CardDescription>Popular exercises you might want to try</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="p-4">
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-3 w-1/3 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-8 w-28 mt-4" />
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-12 lg:col-span-6 xl:col-span-7">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">Suggested Exercises</CardTitle>
          <CardDescription>Popular exercises you might want to try</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() => navigate('/exercise-library-enhanced')}
        >
          View All <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayExercises.length > 0 ? (
            displayExercises.map((exercise) => (
              <Card key={exercise.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium truncate">{exercise.name}</h3>
                    {exercise.difficulty && (
                      <Badge variant="outline" className="capitalize">
                        {exercise.difficulty}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <Dumbbell className="h-3.5 w-3.5" />
                    <span>{exercise.primary_equipment || 'Bodyweight'}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {exercise.prime_mover_muscle && (
                      <Badge variant="secondary" className="bg-secondary/50">
                        {exercise.prime_mover_muscle}
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4"
                    onClick={() => handleViewDetails(exercise.id.toString())}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-2 py-8 text-center">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
              <h3 className="text-lg font-medium">No exercises available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No suggested exercises found at the moment
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/exercise-library-enhanced')}
              >
                Browse Exercise Library
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FavoriteExercises;
