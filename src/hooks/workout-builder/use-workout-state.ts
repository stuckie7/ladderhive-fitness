
import { useState } from "react";
import { WorkoutDetail, WorkoutExerciseDetail } from "./types";
import { ExerciseFull } from "@/types/exercise";

export const useWorkoutState = () => {
  // Workout info state
  const [workout, setWorkout] = useState<WorkoutDetail>({
    title: "",
    difficulty: "beginner",
    category: "strength",
    description: "",
    is_template: false
  });
  
  // Workout exercises state
  const [exercises, setExercises] = useState<WorkoutExerciseDetail[]>([]);
  
  // Templates state
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ExerciseFull[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all_muscle_groups");
  const [selectedEquipment, setSelectedEquipment] = useState("all_equipment");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all_difficulties");
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  return {
    workout,
    setWorkout,
    exercises,
    setExercises,
    templates,
    setTemplates,
    isLoadingTemplates,
    setIsLoadingTemplates,
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

export type WorkoutStateType = ReturnType<typeof useWorkoutState>;
