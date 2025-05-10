
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Plus, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Exercise } from "@/types/exercise";

interface FavoriteExercisesProps {
  exercises: Exercise[];
  isLoading: boolean;
  onAddExercise?: () => void;
}

const FavoriteExercises = ({ exercises, isLoading, onAddExercise }: FavoriteExercisesProps) => {
  return (
    <Card className="glass-panel h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2 text-fitness-accent">
          <Star className="h-5 w-5" />
          <span>Favorite Exercises</span>
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={onAddExercise}
        >
          <Plus className="h-4 w-4 mr-1" />
          <span>Add</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : exercises.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exercises.map((exercise) => (
              <Link 
                key={exercise.id} 
                to={`/exercises/${exercise.id}`}
                className="p-3 border border-gray-800/50 rounded-lg hover:border-fitness-accent/50 hover:bg-gray-900/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-fitness-accent/10 p-2 rounded-full">
                    <Dumbbell className="h-4 w-4 text-fitness-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm group-hover:text-fitness-accent transition-colors line-clamp-1">{exercise.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {exercise.muscle_group || exercise.bodyPart || ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Dumbbell className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-white">No favorites yet</h3>
            <p className="mt-2 text-gray-400">
              Add exercises to your favorites for quick access
            </p>
            <Link to="/exercises">
              <Button className="mt-6 btn-fitness-accent">
                <Plus className="mr-2 h-4 w-4" /> Browse Exercises
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FavoriteExercises;
