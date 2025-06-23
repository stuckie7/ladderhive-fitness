import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useWorkoutDetail } from '@/hooks/workout-detail';
import { useWods } from '@/hooks/wods/use-wods';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Very lightweight workout "player".  For now it simply shows the workout title
// and starts a timer immediately.  This fulfils the requested behaviour of
// displaying a read-only view with a running timer.
const WorkoutPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workout, isLoading } = useWorkoutDetail(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedWod, isLoading: wodLoading, fetchWodById } = useWods();

  // if workout not found, try fetching WOD once
  useEffect(() => {
    if (!isLoading && !workout && id) {
      fetchWodById(id);
    }
  }, [isLoading, workout, id, fetchWodById]);

  // derive steps (exercises or wod parts)
  const steps = React.useMemo(() => {
    if (workout && workout.exercises) {
      return workout.exercises.map((ex: any, idx: number) => ({
        id: ex.id || idx,
        label: ex.exercise?.name || `Exercise ${idx + 1}`,
        detail: `${ex.sets || ''}x${ex.reps || ''}`.replace(/^x|x$/, '')
      }));
    }
    if (selectedWod) {
      const partFields = [
        selectedWod.part_1,
        selectedWod.part_2,
        selectedWod.part_3,
        selectedWod.part_4,
        selectedWod.part_5,
        selectedWod.part_6,
        selectedWod.part_7,
        selectedWod.part_8,
        selectedWod.part_9,
        selectedWod.part_10
      ].filter((p) => p && p.trim().length > 0);
      if (partFields.length > 0) {
        return partFields.map((p, idx) => ({ id: idx, label: p as string, detail: '' }));
      }
      if (selectedWod.components) {
        return Object.keys(selectedWod.components).map((key, idx) => ({ id: idx, label: key, detail: JSON.stringify(selectedWod.components[key]) }));
      }
    }
    return [];
  }, [workout, selectedWod]);

  // current step index
  const [currentStep, setCurrentStep] = useState(0);

  // simple seconds counter
  const [seconds, setSeconds] = useState(0);
  const startTimeRef = useRef<Date | null>(null);
  useEffect(() => {
    startTimeRef.current = new Date();
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (total: number) => {
    const mins = Math.floor(total / 60)
      .toString()
      .padStart(2, '0');
    const secs = (total % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate('/')}>  {/* Back home */}
          <ArrowLeft className="mr-2 h-4 w-4" />
          Home
        </Button>

        {(isLoading || wodLoading) && !workout && !selectedWod ? (
          <p className="text-center text-muted-foreground">Loading workout…</p>
        ) : (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold">{workout ? workout.title : selectedWod?.name}</h1>
            <p className="text-6xl font-mono">{formatTime(seconds)}</p>
            <p className="text-muted-foreground">
              This is a minimal workout player. A richer experience (rep counting,
              rest tracking, etc.) will land soon.
            </p>
                      {/* Steps list */}
            {steps.length > 0 && (
              <div className="max-w-md mx-auto space-y-2 text-left">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg border ${idx === currentStep ? 'bg-primary/10 border-primary' : 'border-muted'}`}
                  >
                    <div className="font-medium">{step.label}</div>
                    {step.detail && <div className="text-sm text-muted-foreground">{step.detail}</div>}
                  </div>
                ))}
              </div>
            )}

            {steps.length > 0 && currentStep < steps.length - 1 && (
              <Button onClick={() => setCurrentStep((s) => s + 1)} className="mt-4">
                Next
              </Button>
            )}

            {/* Finish button */}
            <Button
              variant="default"
              className="mt-6"
              onClick={async () => {
                if (!user) {
                  toast({ title: 'Please sign in' });
                  return;
                }
                try {
                  await supabase.from('workout_sessions').insert({
                    user_id: user.id,
                    workout_id: workout ? workout.id : null,
                    wod_id: selectedWod ? selectedWod.id : null,
                    started_at: startTimeRef.current?.toISOString(),
                    ended_at: new Date().toISOString(),
                  });
                  toast({ title: 'Workout logged! 🎉' });
                  navigate('/progress');
                } catch (e) {
                  console.error(e);
                  toast({ title: 'Error saving session', variant: 'destructive' });
                }
              }}
            >
              Finish Workout
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default WorkoutPlayer;
