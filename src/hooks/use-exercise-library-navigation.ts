
import { useNavigate } from "react-router-dom";

export const useExerciseLibraryNavigation = () => {
  const navigate = useNavigate();
  
  const goToEnhancedExerciseLibrary = () => {
    navigate("/exercise-library-enhanced");
  };
  
  const goToExerciseLibrary = () => {
    navigate("/exercise-library");
  };
  
  return {
    goToEnhancedExerciseLibrary,
    goToExerciseLibrary
  };
};
