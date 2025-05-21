import React from 'react';
import { useAltWorkouts } from '@/hooks/workouts/use-alt-workouts';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const AltWorkouts: React.FC = () => {
  const { workouts, isLoading, error } = useAltWorkouts();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">ALT Workouts</h1>
        <div className="text-red-500">Error loading workouts: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">ALT Workouts</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))
        ) : workouts.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No ALT workouts available yet</p>
          </div>
        ) : (
          workouts.map((workout) => (
            <Card key={workout.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg font-semibold">{workout.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {workout.difficulty}
                  </Badge>
                </div>
                <CardDescription className="text-sm text-muted-foreground mb-4">
                  {workout.description}
                </CardDescription>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{workout.duration} min</span>
                  <span>·</span>
                  <span>{workout.exercises.length} exercises</span>
                </div>
              </CardHeader>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {workout.exercises.slice(0, 4).map((exercise) => (
                    <div key={exercise.id} className="flex items-center gap-2">
                      <img
                        src={exercise.exercise.thumbnail_url}
                        alt={exercise.exercise.name}
                        className="w-8 h-8 rounded"
                      />
                      <span className="text-sm">{exercise.exercise.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Link to={`/workout/${workout.id}`}>
                <Button variant="outline" className="w-full mt-4">
                  Start Workout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AltWorkouts;
