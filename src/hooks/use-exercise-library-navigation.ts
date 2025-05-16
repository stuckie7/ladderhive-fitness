
import { useNavigate } from "react-router-dom";

export const useExerciseLibraryNavigation = () => {
  const navigate = useNavigate();
  
  const goToExerciseLibrary = () => {
    // Updated to navigate to the enhanced library by default
    navigate("/exercises/enhanced");
  };
  
  const goToEnhancedLibrary = () => {
    navigate("/exercises/enhanced");
  };
  
  const goToSimpleLibrary = () => {
    navigate("/exercises/simple");
  };
  
  const goToExerciseDetail = (exerciseId: string | number) => {
    navigate(`/exercises/${exerciseId}`);
  };
  
  const goToEnhancedExerciseDetail = (exerciseId: string | number) => {
    navigate(`/exercises/enhanced/${exerciseId}`);
  };
  
  const goToWorkoutBuilder = () => {
    navigate("/workout-builder");
  };
  
  const goToWorkoutDetail = (workoutId: string) => {
    navigate(`/workouts/${workoutId}`);
  };
  
  return {
    goToExerciseLibrary,
    goToEnhancedLibrary,
    goToSimpleLibrary,
    goToExerciseDetail,
    goToEnhancedExerciseDetail,
    goToWorkoutBuilder,
    goToWorkoutDetail
  };
};
