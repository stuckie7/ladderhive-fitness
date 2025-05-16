
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Exercise, ExerciseFull } from '@/types/exercise';
import ExerciseSpecItem from './ExerciseSpecItem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AddToWorkoutButton from '../AddToWorkoutButton';
import { Bookmark, BookmarkCheck, Dumbbell, Flame, Target } from 'lucide-react';

interface ExerciseSidebarContentProps {
  exercise: Exercise | ExerciseFull | null;
  loading: boolean;
}

const ExerciseSidebarContent: React.FC<ExerciseSidebarContentProps> = ({ exercise, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No exercise data available</p>
        </CardContent>
      </Card>
    );
  }

  // Helper function to get image URL with fallbacks
  const getImageUrl = () => {
    // Order of priority for image sources
    return (
      exercise.youtube_thumbnail_url || 
      exercise.image_url || 
      '/placeholder.svg'
    );
  };

  // Create an exercise object with necessary properties for AddToWorkoutButton
  const exerciseForButton = {
    id: exercise.id,
    name: exercise.name
  };

  return (
    <div className="space-y-4">
      {/* Exercise Image */}
      <Card className="overflow-hidden border-2 border-muted">
        <div className="aspect-video relative">
          <img
            src={getImageUrl()}
            alt={exercise.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
      </Card>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-2">
        <AddToWorkoutButton exercise={exerciseForButton as Exercise} />
        <Button variant="outline" className="w-full flex items-center justify-center gap-2">
          <Bookmark className="h-4 w-4" />
          Save Exercise
        </Button>
      </div>
      
      {/* Exercise Specifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Muscle Groups
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 gap-3">
            {exercise.prime_mover_muscle && (
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Primary</h3>
                <Badge variant="secondary" className="font-normal">
                  {exercise.prime_mover_muscle}
                </Badge>
              </div>
            )}
            
            {exercise.secondary_muscle && (
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Secondary</h3>
                <Badge variant="outline" className="font-normal">
                  {exercise.secondary_muscle}
                </Badge>
              </div>
            )}
            
            {exercise.tertiary_muscle && (
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Tertiary</h3>
                <Badge variant="outline" className="font-normal">
                  {exercise.tertiary_muscle}
                </Badge>
              </div>
            )}
            
            {!exercise.prime_mover_muscle && !exercise.secondary_muscle && !exercise.tertiary_muscle && (
              <p className="text-sm text-muted-foreground">No muscle group information available</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Equipment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            Equipment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            {exercise.primary_equipment || exercise.equipment ? (
              <div className="flex gap-2 flex-wrap">
                <Badge className="font-normal">
                  {exercise.primary_equipment || exercise.equipment}
                </Badge>
                {exercise.secondary_equipment && (
                  <Badge variant="outline" className="font-normal">
                    {exercise.secondary_equipment}
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No equipment information available</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Additional details */}
      {(exercise.body_region || exercise.difficulty) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {exercise.body_region && (
                <div>
                  <h3 className="text-sm text-muted-foreground mb-1">Body Region</h3>
                  <p className="text-sm">{exercise.body_region}</p>
                </div>
              )}
              
              {exercise.difficulty && (
                <div>
                  <h3 className="text-sm text-muted-foreground mb-1">Difficulty</h3>
                  <p className="text-sm capitalize">{exercise.difficulty}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExerciseSidebarContent;
