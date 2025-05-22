
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Exercise } from '@/types/exercise';
import { Button } from '@/components/ui/button';
import { Dumbbell, Loader2, Plus, Star } from 'lucide-react';

interface FavoriteExercisesProps {
  exercises: Exercise[];
  isLoading: boolean;
  onAddExercise: () => void;
  onRemoveFavorite: (exerciseId: string) => Promise<void>;
}

const FavoriteExercises: React.FC<FavoriteExercisesProps> = ({
  exercises,
  isLoading,
  onAddExercise,
  onRemoveFavorite,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Favorite Exercises</CardTitle>
        <Button onClick={onAddExercise} size="sm" variant="ghost">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No favorite exercises yet</p>
            <Button
              variant="link"
              className="mt-2"
              onClick={onAddExercise}
            >
              Add exercises to your favorites
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
              >
                <div>
                  <p className="font-medium">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {exercise.target || exercise.bodyPart || exercise.muscle_groups?.[0] || exercise.prime_mover_muscle || 'General'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveFavorite(exercise.id.toString())}
                  title="Remove from favorites"
                >
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FavoriteExercises;
