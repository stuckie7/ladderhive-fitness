
import { useState, useEffect } from 'react';
import { addDays, format } from 'date-fns';

interface UpcomingWorkout {
  id: string;
  title: string;
  date: string;
  duration: number;
  difficulty: string;
  type?: 'wod' | 'workout';
}

export const useUpcomingWorkouts = () => {
  const [workouts, setWorkouts] = useState<UpcomingWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUpcomingWorkouts = async () => {
      try {
        setIsLoading(true);
        
        // Mock data for testing
        const mockWorkouts: UpcomingWorkout[] = [
          {
            id: '1',
            title: 'Full Body Strength',
            date: format(addDays(new Date(), 0), "yyyy-MM-dd'T'HH:mm:ss"),
            duration: 45,
            difficulty: 'Intermediate',
            type: 'workout'
          },
          {
            id: '2',
            title: 'HIIT Cardio',
            date: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss"),
            duration: 30,
            difficulty: 'Advanced',
            type: 'wod'
          }
        ];
        
        setWorkouts(mockWorkouts);
      } catch (err) {
        console.error('Error fetching upcoming workouts:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingWorkouts();
  }, []);

  return { workouts, isLoading, error };
};
