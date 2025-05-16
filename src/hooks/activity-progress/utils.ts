
import { ActivityData } from "@/types/activity";
import { format, subDays } from "date-fns";

/**
 * Get date strings for the last N days
 */
export const getLastNDays = (days: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    dates.push(format(date, 'yyyy-MM-dd'));
  }
  
  return dates;
};

/**
 * Format raw data from the API into the ActivityData structure
 */
export const formatActivityData = (
  rawData: any[],
  dateRange: string[]
): ActivityData[] => {
  // Create a map of dates to data for quick lookup
  const dataMap = new Map();
  if (rawData) {
    rawData.forEach(item => {
      dataMap.set(item.date, item);
    });
  }
  
  // Build the formatted data array with all dates in range
  return dateRange.map(date => {
    const dayData = dataMap.get(date);
    const dayOfWeek = format(new Date(date), 'E'); // Mon, Tue, etc.
    
    return {
      date: date,
      day: dayOfWeek,
      steps: dayData?.step_count || 0,
      active_minutes: dayData?.active_minutes || 0,
      workouts: dayData?.workouts_completed || 0
    };
  });
};
