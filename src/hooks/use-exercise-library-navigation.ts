
import { useNavigate } from "react-router-dom";

export const useExerciseLibraryNavigation = () => {
  const navigate = useNavigate();
  
  const goToExerciseLibrary = () => {
    navigate("/exercise-library");
  };
  
  return {
    goToExerciseLibrary
  };
};
