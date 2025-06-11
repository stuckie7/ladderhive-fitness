export interface FitbitHealthData {
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
  heartRate: number | null;
  sleepDuration: number | null;
  lastSynced: string | null;
  goal: number;
  progress: number;
  workouts: number;
}

export interface FitbitAuthResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  user_id: string;
}

export interface FitbitError {
  errors: Array<{
    errorType: string;
    fieldName: string;
    message: string;
  }>;
  success: boolean;
}
