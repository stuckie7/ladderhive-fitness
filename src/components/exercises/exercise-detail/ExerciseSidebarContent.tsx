
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Exercise, ExerciseFull } from '@/types/exercise';
import ExerciseSpecItem from './ExerciseSpecItem';

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
    return <div>No exercise data available</div>;
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

  // Determine equipment display value
  const equipmentDisplay = exercise.equipment || 
                           exercise.primary_equipment || 
                           'Not specified';
  
  // Determine target muscle display value
  const targetMuscleDisplay = exercise.target || 
                              exercise.prime_mover_muscle || 
                              exercise.target_muscle_group || 
                              'Not specified';
  
  // Determine body region display value
  const bodyRegionDisplay = exercise.bodyPart || 
                            exercise.body_region || 
                            'Not specified';

  return (
    <>
      {/* Exercise Image */}
      <Card className="mb-4 overflow-hidden">
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
      
      {/* Exercise Specifications */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-3">Exercise Specifications</h3>
          <div className="space-y-2">
            <ExerciseSpecItem 
              label="Target Muscle"
              value={targetMuscleDisplay}
            />
            <ExerciseSpecItem 
              label="Equipment"
              value={equipmentDisplay}
            />
            <ExerciseSpecItem 
              label="Body Region"
              value={bodyRegionDisplay}
            />
            <ExerciseSpecItem 
              label="Difficulty"
              value={exercise.difficulty || 'Not specified'}
            />
            {exercise.mechanics && (
              <ExerciseSpecItem 
                label="Mechanics"
                value={exercise.mechanics}
              />
            )}
            {exercise.force_type && (
              <ExerciseSpecItem 
                label="Force Type"
                value={exercise.force_type}
              />
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Additional Details */}
      {(exercise.secondary_muscle || exercise.tertiary_muscle) && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3">Additional Muscle Groups</h3>
            <div className="space-y-2">
              {exercise.secondary_muscle && (
                <ExerciseSpecItem 
                  label="Secondary"
                  value={exercise.secondary_muscle}
                />
              )}
              {exercise.tertiary_muscle && (
                <ExerciseSpecItem 
                  label="Tertiary"
                  value={exercise.tertiary_muscle}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ExerciseSidebarContent;
