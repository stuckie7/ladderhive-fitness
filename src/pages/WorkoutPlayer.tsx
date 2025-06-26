
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import VideoEmbed from '@/components/workouts/detail/VideoEmbed';
import { ArrowLeft } from 'lucide-react';
import { useWorkoutDetail } from '@/hooks/workout-detail';
import { useWods } from '@/hooks/wods/use-wods';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getBestVideoUrl } from '@/utils/video';

// Local helper types
type Step = {
  id: number | string;
  label: string;
  detail: string;
};

const WorkoutPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Simplified loading states
  const [isInitializing, setIsInitializing] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [workout, setWorkout] = useState<any>(null);
  const [selectedWod, setSelectedWod] = useState<any>(null);

  // Initialize content loading
  useEffect(() => {
    const initializeContent = async () => {
      if (!id) {
        setIsInitializing(false);
        return;
      }

      console.log('Initializing workout player for ID:', id);
      
      try {
        // Try to fetch workout first
        const { data: workoutData } = await supabase
          .from('prepared_workouts')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (workoutData) {
          console.log('Found workout:', workoutData.title);
          setWorkout(workoutData);
          setContentLoaded(true);
        } else {
          // Try to fetch WOD
          const { data: wodData } = await supabase
            .from('wods')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (wodData) {
            console.log('Found WOD:', wodData.name);
            setSelectedWod(wodData);
            setContentLoaded(true);
          }
        }
      } catch (error) {
        console.error('Error initializing content:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeContent();
  }, [id]);

  // derive steps (exercises or wod parts)
  const steps = React.useMemo<Step[]>(() => {
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
      // Fallback – interpret `components` if present
      if (selectedWod?.components) {
        // Array form
        if (Array.isArray(selectedWod.components)) {
          return selectedWod.components.map((comp: any, idx) => ({
            id: idx,
            label: comp?.name ?? `Component ${idx + 1}`,
            detail: JSON.stringify(comp),
          }));
        }
        // Object map form
        if (typeof selectedWod.components === 'object') {
          return Object.entries(selectedWod.components as Record<string, unknown>).map(([key, val], idx) => ({
            id: idx,
            label: key,
            detail: JSON.stringify(val),
          }));
        }
      }
    }
    return [];
  }, [workout, selectedWod]);

  // current step index
  const [currentStep, setCurrentStep] = useState(0);

  // current exercise video url
  const currentVideoUrl = React.useMemo(() => {
    const exerciseObj = workout && workout.exercises && workout.exercises[currentStep]
      ? workout.exercises[currentStep].exercise
      : undefined;
    return getBestVideoUrl(exerciseObj, selectedWod) || '';
  }, [workout, currentStep, selectedWod]);

  // auto-advance cycle (work/rest)
  const WORK_SEC = 45;
  const REST_SEC = 15;

  // finish handler
  const handleFinish = async () => {
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
  };
  
  const [phase, setPhase] = useState<'work' | 'rest'>('work');
  const [phaseRemaining, setPhaseRemaining] = useState(WORK_SEC);

  // simple seconds counter
  const [seconds, setSeconds] = useState(0);
  const startTimeRef = useRef<Date | null>(null);
  
  useEffect(() => {
    if (!contentLoaded) return;
    
    startTimeRef.current = new Date();
    const main = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(main);
  }, [contentLoaded]);

  // phase countdown and auto-advance
  useEffect(() => {
    if (steps.length === 0 || !contentLoaded) return;
    
    const timer = setInterval(() => {
      setPhaseRemaining((prev) => {
        if (prev > 1) return prev - 1;

        // === Phase finished ===
        if (phase === 'work') {
          // Switch to rest, if any
          if (REST_SEC > 0) {
            setPhase('rest');
            return REST_SEC;
          }
        } else {
          // Rest just ended – time to advance or finish
          if (currentStep >= steps.length - 1) {
            clearInterval(timer);
            handleFinish();
            return 0;
          }
          // move to next step
          setPhase('work');
          setCurrentStep((s) => s + 1);
          return WORK_SEC;
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, currentStep, steps.length, contentLoaded]);

  const formatTime = (total: number) => {
    const mins = Math.floor(total / 60)
      .toString()
      .padStart(2, '0');
    const secs = (total % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // progress percentage for current phase (0 – 100)
  const phasePercent = React.useMemo(() => {
    const total = phase === 'work' ? WORK_SEC : REST_SEC;
    return ((total - phaseRemaining) / total) * 100;
  }, [phase, phaseRemaining]);

  // haptic / audio cue on phase change
  useEffect(() => {
    if (!contentLoaded) return;
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, [phase, contentLoaded]);

  // last-done lookup
  const { data: lastSession } = useSWR(
    user && id && contentLoaded ? `/api/last-session/${id}` : null,
    async () => {
      const { data } = await supabase
        .from('workout_sessions')
        .select('performed_at')
        .eq('user_id', user?.id)
        .eq('workout_id', id)
        .order('performed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data?.performed_at as string | undefined;
    }
  );

  // Show error if no content found after loading
  if (!isInitializing && !contentLoaded) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 space-y-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Home
          </Button>
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Workout Not Found</h1>
            <p className="text-muted-foreground">The workout you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/workouts')}>
              Browse Workouts
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="p-4">
          {lastSession && (
            <div className="mb-2 text-sm text-muted-foreground text-right">
              Last done: {new Date(lastSession).toLocaleDateString()}
            </div>
          )}
          <div className="container mx-auto px-4 py-6 space-y-6">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>

            {isInitializing ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground">Loading workout…</p>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <h1 className="text-3xl font-bold">{workout ? workout.title : selectedWod?.name}</h1>
                <p className="text-6xl font-mono">{formatTime(seconds)}</p>
                
                {/* Phase progress bar */}
                <div className="w-full max-w-md mx-auto bg-muted/30 h-2 rounded">
                  <div
                    className="h-2 bg-primary rounded transition-all"
                    style={{ width: `${phasePercent}%` }}
                  />
                </div>

                {/* Video area */}
                {currentVideoUrl && <VideoEmbed videoUrl={currentVideoUrl} />}
                
                <p className="text-lg font-semibold capitalize">
                  {phase === 'work' ? 'Work' : 'Rest'} — {phaseRemaining}s
                </p>
                
                {/* Steps list */}
                {steps.length > 0 && (
                  <div className="max-w-md mx-auto space-y-2 text-left">
                    {steps.map((step: Step, idx: number) => (
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

                {/* Finish button */}
                <Button className="mt-6" onClick={handleFinish}>
                  Finish Workout
                </Button>
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
};

export default WorkoutPlayer;
