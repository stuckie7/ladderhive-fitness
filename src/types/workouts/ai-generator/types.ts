export interface AIGenerationParams {
  workoutType: 'strength' | 'hypertrophy' | 'endurance' | 'functional';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetMuscleGroups: string[];
  equipment: string[];
  duration: number; // in minutes
  intensity: number; // 1-10 RPE scale
  previousWorkouts?: string[];
  personalRecords?: Record<string, number>;
}

export interface GeneratedWorkout {
  name: string;
  description: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    rest: number;
    intensity: number;
    muscleGroups: string[];
    equipment: string[];
    alternatives: string[];
    notes: string;
  }[];
  totalVolume: number;
  estimatedDuration: number;
  recommendations: string[];
  rationale: string;
}

export interface AIWorkoutGeneratorState {
  params: AIGenerationParams;
  generatedWorkout: GeneratedWorkout | null;
  isGenerating: boolean;
  error: string | null;
  suggestions: string[];
}
