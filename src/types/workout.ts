
// Define types for workout data
export interface Workout {
  id: string;
  title: string;
  description: string;
  duration: number;
  exercises: number;
  difficulty: string;
  date?: string;
  isSaved?: boolean;
}

export interface UserWorkout {
  id: string;
  user_id: string;
  workout_id: string;
  status: string;
  completed_at: string | null;
  planned_for: string | null;
  workout: Workout;
  date?: string;
}
