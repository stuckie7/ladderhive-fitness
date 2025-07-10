
import { useState } from "react";
import { useWorkoutsFetch } from "./use-workouts-fetch";
import { useWorkoutsActions } from "./use-workouts-actions";
import { Workout } from "@/types/workout";

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  // Initialize the fetch and actions hooks with our state setters
  const { fetchAllWorkouts, fetchSavedWorkouts } = useWorkoutsFetch(isLoading, setIsLoading);
  const { saveWorkout, unsaveWorkout, completeWorkout, scheduleWorkout } = 
    useWorkoutsActions(isLoading, setIsLoading);
  
  // Fetch all workouts on load
  const fetchWorkouts = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllWorkouts();
      setWorkouts(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch workouts");
      console.error("Error in useWorkouts:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    workouts,
    isLoading,
    error,
    fetchWorkouts,
    saveWorkout,
    unsaveWorkout,
    completeWorkout,
    scheduleWorkout
  };
};
