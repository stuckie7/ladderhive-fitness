export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: string;
  video_url: string | null;
}

// Database Exercise type
export interface DatabaseExercise {
  id: number;
  name: string;
  description: string | null;
  equipment: string | null;
  difficulty: string;
  muscle_groups: string[];
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIWorkoutPlan {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  focus: string;
  equipment: string[];
  exercises: Exercise[];
}

export interface AIWorkoutPlansState {
  loading: boolean;
  error: string | null;
  plans: AIWorkoutPlan[];
  selectedPlan: AIWorkoutPlan | null;
}

export interface AIWorkoutPlanFilters {
  difficulty: string;
  duration: string;
  focus: string;
  equipment: string[];
}
