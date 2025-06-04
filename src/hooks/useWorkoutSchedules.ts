import { useState, useEffect, useCallback } from 'react';
import { WorkoutSchedule } from '@/types/workout';
import { workoutScheduleService } from '@/services/workoutScheduleService';
import { useAuth } from '@/context/AuthContext';

export function useWorkoutSchedules() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSchedules = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await workoutScheduleService.getWorkoutSchedules();
      setSchedules(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching workout schedules:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch workout schedules'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const createSchedule = async (schedule: Omit<WorkoutSchedule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newSchedule = await workoutScheduleService.createWorkoutSchedule({
        ...schedule,
        user_id: user?.id || '',
      });
      
      setSchedules(prev => [...prev, newSchedule]);
      return { success: true, data: newSchedule };
    } catch (err) {
      console.error('Error creating workout schedule:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to create workout schedule') 
      };
    }
  };

  const updateSchedule = async (id: string, updates: Partial<WorkoutSchedule>) => {
    try {
      const updatedSchedule = await workoutScheduleService.updateWorkoutSchedule(id, updates);
      
      setSchedules(prev => 
        prev.map(schedule => 
          schedule.id === id ? { ...schedule, ...updatedSchedule } : schedule
        )
      );
      
      return { success: true, data: updatedSchedule };
    } catch (err) {
      console.error('Error updating workout schedule:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to update workout schedule') 
      };
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      await workoutScheduleService.deleteWorkoutSchedule(id);
      
      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting workout schedule:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to delete workout schedule') 
      };
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return {
    schedules,
    loading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    refresh: fetchSchedules,
  };
}
