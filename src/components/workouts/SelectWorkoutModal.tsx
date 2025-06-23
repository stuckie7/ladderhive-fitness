import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import type { Workout } from '@/types/workout';
import { Loader2 } from 'lucide-react';

interface SelectWorkoutModalProps {
  exerciseId: number | string;
  onClose: () => void;
}

const SelectWorkoutModal: React.FC<SelectWorkoutModalProps> = ({ exerciseId, onClose }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching workouts', error);
        toast.error('Failed to load workouts');
      } else {
        setWorkouts(data as Workout[]);
      }
      setLoading(false);
    };
    fetchWorkouts();
  }, []);

  const handleAdd = async (workoutId: string) => {
    setAddingId(workoutId);
    try {
      // find next order_index
      const { data: maxOrderData, error: orderErr } = await supabase
        .from('workout_exercises')
        .select('order_index')
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (orderErr) throw orderErr;
      const nextOrder = maxOrderData?.order_index ? maxOrderData.order_index + 1 : 1;

      const { error } = await supabase.from('workout_exercises').insert({
        workout_id: workoutId,
        exercise_id: exerciseId,
        sets: 3,
        reps: '8-12',
        order_index: nextOrder,
      });
      if (error) throw error;
      toast.success('Exercise added to workout');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add exercise');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Select a workout</DialogTitle>
        <DialogDescription>
          Choose one of your workouts to add this exercise.
        </DialogDescription>
      </DialogHeader>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : workouts.length === 0 ? (
        <p className="text-center text-muted-foreground">You don’t have any workouts yet.</p>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-2">
          {workouts.map((w) => (
            <Button
              key={w.id}
              variant="secondary"
              className="w-full justify-between"
              disabled={addingId === w.id}
              onClick={() => handleAdd(w.id)}
            >
              <span>{w.title}</span>
              {addingId === w.id && <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>
          ))}
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </DialogFooter>
    </div>
  );
};

export default SelectWorkoutModal;
