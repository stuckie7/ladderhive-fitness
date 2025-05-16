
import { Workout, UserWorkout } from "@/types/workout";
import WorkoutCard from "@/components/workouts/WorkoutCard";

interface WorkoutListProps {
  isLoading: boolean;
  items: Workout[] | UserWorkout[];
  emptyMessage: string;
  showDate?: boolean;
}

const WorkoutList = ({ isLoading, items, emptyMessage, showDate = false }: WorkoutListProps) => {
  if (isLoading) {
    return <p>Loading workouts...</p>;
  }
  
  if (items.length === 0) {
    return <p>{emptyMessage}</p>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        // Check if it's a UserWorkout (has a workout property) or a regular Workout
        const isUserWorkout = 'workout' in item;
        const workout = isUserWorkout 
          ? { 
              ...item.workout, 
              date: showDate ? item.date : undefined
            } 
          : item;
            
        return (
          <WorkoutCard 
            key={isUserWorkout ? item.id : workout.id} 
            workout={workout} 
            isSaved={isUserWorkout || (workout as Workout).isSaved}
          />
        );
      })}
    </div>
  );
};

export default WorkoutList;
