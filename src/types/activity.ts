
export interface ActivityData {
  date: string;
  day: string;
  steps: number;
  active_minutes: number;
  workouts: number;
}

export interface MonthlySummary {
  totalSteps: number;
  avgStepsPerDay: number;
  totalActiveMinutes: number;
  avgActiveMinutesPerDay: number;
  totalWorkouts: number;
  avgWorkoutsPerWeek: number;
  completionRate: number;
  mostActiveDay: {
    name: string;
    steps: number;
  };
}
