
import { useState } from "react";
import { WorkoutDetail, WorkoutExerciseDetail } from "./types";

export interface WorkoutStateType {
  workout: WorkoutDetail;
  exercises: WorkoutExerciseDetail[];
  searchQuery: string;
  searchResults: any[];
  selectedMuscleGroup: string;
  selectedEquipment: string;
  selectedDifficulty: string;
  isLoading: boolean;
  isSaving: boolean;
  
  setWorkout: React.Dispatch<React.SetStateAction<WorkoutDetail>>;
  setExercises: React.Dispatch<React.SetStateAction<WorkoutExerciseDetail[]>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setSearchResults: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedMuscleGroup: React.Dispatch<React.SetStateAction<string>>;
  setSelectedEquipment: React.Dispatch<React.SetStateAction<string>>;
  setSelectedDifficulty: React.Dispatch<React.SetStateAction<string>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useWorkoutState = (): WorkoutStateType => {
  // Core state
  const [workout, setWorkout] = useState<WorkoutDetail>({
    title: "New Workout",
    description: "",
    difficulty: "beginner",
    category: "strength",
    goal: "strength",
    duration_minutes: 30,
    is_template: false
  });
  
  const [exercises, setExercises] = useState<WorkoutExerciseDetail[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Filter state
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  return {
    workout,
    exercises,
    searchQuery,
    searchResults,
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    isLoading,
    isSaving,
    
    setWorkout,
    setExercises,
    setSearchQuery,
    setSearchResults,
    setSelectedMuscleGroup,
    setSelectedEquipment,
    setSelectedDifficulty,
    setIsLoading,
    setIsSaving
  };
};
