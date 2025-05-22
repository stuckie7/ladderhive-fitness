import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * This is a temporary redirect component that forwards to the Workouts page.
 * It's needed because there are references to this path in the codebase.
 */
const WorkoutLibrary = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the workouts page
    navigate('/workouts', { replace: true });
  }, [navigate]);

  // Return null since we're redirecting
  return null;
};

export default WorkoutLibrary;
