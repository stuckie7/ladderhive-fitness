
import { useNavigate } from "react-router-dom";

export const useExerciseLibraryNavigation = () => {
  const navigate = useNavigate();
  
  const goToExerciseLibrary = () => {
    navigate("/exercise-library");
  };
  
  const goToWorkoutBuilder = () => {
    navigate("/workout-builder");
  };
  
  const goToWorkoutDetail = (workoutId: string) => {
    navigate(`/workouts/${workoutId}`);
  };
  
  return {
    goToExerciseLibrary,
    goToWorkoutBuilder,
    goToWorkoutDetail
  };
};
