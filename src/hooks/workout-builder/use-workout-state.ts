
import { useState } from "react";
import { WorkoutDetail, WorkoutExerciseDetail } from "./types";

export interface WorkoutStateType {
  workout: WorkoutDetail;
  setWorkout: React.Dispatch<React.SetStateAction<WorkoutDetail>>;
  exercises: WorkoutExerciseDetail[];
  setExercises: React.Dispatch<React.SetStateAction<WorkoutExerciseDetail[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchResults: any[];
  setSearchResults: React.Dispatch<React.SetStateAction<any[]>>;
  selectedMuscleGroup: string | null;
  setSelectedMuscleGroup: React.Dispatch<React.SetStateAction<string | null>>;
  selectedEquipment: string | null;
  setSelectedEquipment: React.Dispatch<React.SetStateAction<string | null>>;
  selectedDifficulty: string | null;
  setSelectedDifficulty: React.Dispatch<React.SetStateAction<string | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isSaving: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useWorkoutState = () => {
  // Main workout data
  const [workout, setWorkout] = useState<WorkoutDetail>({
    id: '',
    title: 'New Workout',
    description: '',
    difficulty: 'Beginner',
    category: 'General',
    duration_minutes: 30,
    exercises: [] // Always initialize with empty array
  });
  
  // Exercises in the workout
  const [exercises, setExercises] = useState<WorkoutExerciseDetail[]>([]);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  return {
    workout,
    setWorkout,
    exercises,
    setExercises,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    selectedEquipment,
    setSelectedEquipment,
    selectedDifficulty,
    setSelectedDifficulty,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving
  };
};
