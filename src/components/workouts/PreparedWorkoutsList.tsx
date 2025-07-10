
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Clock, Dumbbell, Play } from "lucide-react";
import { PreparedWorkout } from '@/types/workout';
import { usePreparedWorkoutsList } from '@/hooks/workouts/use-prepared-workouts-list';
import { Skeleton } from '@/components/ui/skeleton';

const PreparedWorkoutsList = () => {
  const { preparedWorkouts, isLoading } = usePreparedWorkoutsList();
  const navigate = useNavigate();
  
  const handleStartWorkout = (workout: PreparedWorkout) => {
    // Navigate to the enhanced workout detail page
    navigate(`/workout-enhanced/${workout.id}`);
  };
  
  // Group workouts by category
  const workoutsByCategory = preparedWorkouts.reduce((acc, workout) => {
    const category = workout.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(workout);
    return acc;
  }, {} as Record<string, PreparedWorkout[]>);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2].map(j => (
                  <div key={j} className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-9 w-28 rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (preparedWorkouts.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          No prepared workouts available
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {Object.entries(workoutsByCategory).map(([category, workouts]) => (
        <Card key={category} className="overflow-hidden">
          <CardHeader className="pb-2 bg-muted/20">
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {workouts.map((workout) => (
              <div key={workout.id} className="py-3 first:pt-3 last:pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-medium text-foreground">{workout.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-1 items-center text-sm text-muted-foreground">
                      {workout.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {workout.duration_minutes} min
                        </span>
                      )}
                      {workout.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          {workout.difficulty}
                        </Badge>
                      )}
                      {workout.goal && (
                        <span className="text-xs">{workout.goal}</span>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleStartWorkout(workout)}
                    className="whitespace-nowrap"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    View Workout
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PreparedWorkoutsList;
