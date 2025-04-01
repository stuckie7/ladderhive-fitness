
import { ActivityData } from "@/types/activity";

/**
 * Returns an array of date strings for the last n days
 */
export function getLastNDays(days: number = 7): string[] {
  const today = new Date();
  const dates = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

/**
 * Maps database data to ActivityData format, ensuring all days are included
 */
export function formatActivityData(
  rawData: Array<{date: string, step_count: number, active_minutes: number, workouts_completed: number}>,
  dateRange: string[]
): ActivityData[] {
  // Create a map of the fetched data
  const dataMap = new Map<string, ActivityData>();
  
  rawData.forEach(item => {
    dataMap.set(item.date, {
      date: item.date,
      steps: item.step_count,
      active_minutes: item.active_minutes,
      workouts: item.workouts_completed,
      day: '' // Will be set below
    });
  });

  // Ensure we have entries for all days in the range
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return dateRange.map(date => {
    const dayIndex = new Date(date).getDay();
    const day = dayNames[dayIndex];
    
    if (dataMap.has(date)) {
      const entry = dataMap.get(date)!;
      return {
        ...entry,
        day,
      };
    }
    
    // Return a zero-value entry if we don't have data for this day
    return {
      date,
      day,
      steps: 0,
      active_minutes: 0,
      workouts: 0
    };
  });
}
