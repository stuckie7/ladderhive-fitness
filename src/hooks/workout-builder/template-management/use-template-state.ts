
import { create } from "zustand";
import { ExerciseTemplate, WorkoutTemplate } from "./template-types";

// Define the interface explicitly to avoid deep type instantiation
interface TemplateState {
  // Current workout template state
  currentTemplate: WorkoutTemplate | null;
  currentExercises: ExerciseTemplate[];
  
  // Actions
  setCurrentTemplate: (template: WorkoutTemplate | null) => void;
  setCurrentExercises: (exercises: ExerciseTemplate[]) => void;
  addExercise: (exercise: ExerciseTemplate) => void;
  updateExercise: (index: number, exercise: Partial<ExerciseTemplate>) => void;
  removeExercise: (index: number) => void;
  moveExercise: (fromIndex: number, toIndex: number) => void;
  clearTemplate: () => void;
}

// Create the store
export const useTemplateState = create<TemplateState>((set) => ({
  // Initial state
  currentTemplate: null,
  currentExercises: [],
  
  // Template actions
  setCurrentTemplate: (template) => 
    set(() => ({ currentTemplate: template })),
    
  setCurrentExercises: (exercises) => 
    set(() => ({ currentExercises: exercises })),
  
  addExercise: (exercise) => 
    set((state) => ({ 
      currentExercises: [...state.currentExercises, exercise] 
    })),
    
  updateExercise: (index, updatedExercise) => 
    set((state) => {
      const exercises = [...state.currentExercises];
      exercises[index] = { ...exercises[index], ...updatedExercise };
      return { currentExercises: exercises };
    }),
    
  removeExercise: (index) => 
    set((state) => {
      const exercises = [...state.currentExercises];
      exercises.splice(index, 1);
      return { currentExercises: exercises };
    }),
    
  moveExercise: (fromIndex, toIndex) => 
    set((state) => {
      const exercises = [...state.currentExercises];
      const [removed] = exercises.splice(fromIndex, 1);
      exercises.splice(toIndex, 0, removed);
      return { currentExercises: exercises };
    }),
    
  clearTemplate: () => 
    set(() => ({ currentTemplate: null, currentExercises: [] })),
}));
