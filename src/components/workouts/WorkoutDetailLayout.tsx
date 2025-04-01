
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import WorkoutExerciseSection from "@/components/workouts/WorkoutExerciseSection";
import WorkoutProgress from "@/components/workouts/WorkoutProgress";
import NutritionSearch from "@/components/nutrition/NutritionSearch";
import PreparedWorkoutsSection from "@/components/workouts/PreparedWorkoutsSection";
import { Exercise } from "@/types/exercise";

interface WorkoutDetailLayoutProps {
  workoutId?: string;
  exercises: any[];
  isLoading: boolean;
  duration: number;
  onAddExercise: (exercise: Exercise) => Promise<void>;
}

const WorkoutDetailLayout = ({
  workoutId,
  exercises,
  isLoading,
  duration,
  onAddExercise
}: WorkoutDetailLayoutProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <WorkoutExerciseSection 
          workoutId={workoutId}
          exercises={exercises}
          isLoading={isLoading}
          onAddExercise={onAddExercise}
        />
        
        {/* Add Prepared Workouts Section */}
        {workoutId && (
          <PreparedWorkoutsSection 
            currentWorkoutId={workoutId}
            onAddExercise={onAddExercise}
          />
        )}
        
        {/* Add Nutrition Search Component */}
        <div className="mt-6">
          <NutritionSearch />
        </div>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkoutProgress 
              totalExercises={exercises.length} 
              completedExercises={0}
              duration={duration}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutDetailLayout;
