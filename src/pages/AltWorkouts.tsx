
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAltWorkouts } from '@/hooks/workouts/use-alt-workouts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Dumbbell, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AltWorkouts: React.FC = () => {
  const { workouts, isLoading, error } = useAltWorkouts();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" className="mb-6" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold mb-4">ALT Workouts</h1>
          <div className="text-red-500">Error loading workouts: {error}</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">ALT Workouts</h1>
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-64">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full rounded-lg mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : workouts.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No ALT workouts available</p>
            </div>
          ) : (
            workouts.map((workout) => (
              <Link to={`/alt-workout/${workout.id}`} key={workout.id}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  {workout.thumbnail_url ? (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img 
                        src={workout.thumbnail_url} 
                        alt={workout.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-t-lg">
                      <Dumbbell className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{workout.title}</CardTitle>
                      <Badge variant={workout.difficulty === 'Beginner' ? 'outline' : 'secondary'}>
                        {workout.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {workout.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>{workout.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center">
                          <Dumbbell className="mr-1 h-4 w-4" />
                          <span>{workout.exercises.length} exercises</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AltWorkouts;
