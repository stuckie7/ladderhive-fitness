
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { ArrowLeft, Video } from 'lucide-react';
// Importing types only
import type { Workout, WorkoutExercise } from '@/types/workout';
import type { Wod } from '@/types/wod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getBestVideoUrl, getYoutubeEmbedUrl } from '@/utils/video';

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
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [selectedWod, setSelectedWod] = useState<Wod | null>(null);

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
    if (workout && 'exercises' in workout && Array.isArray(workout.exercises)) {
      return workout.exercises.map((ex: WorkoutExercise, idx: number) => ({
        id: ex.id || idx.toString(),
        label: (typeof ex.exercise === 'object' && ex.exercise !== null && 'name' in ex.exercise) 
          ? ex.exercise.name 
          : `Exercise ${idx + 1}`,
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

  // Fetch the prepared workout data including the video URL
  const { data: preparedWorkout } = useSWR(
    workout?.id ? `/api/prepared-workout/${workout.id}` : null,
    async () => {
      const { data, error } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('id', workout?.id)
        .single();
      
      if (error) {
        console.error('Error fetching prepared workout:', error);
        return null;
      }
      return data;
    }
  );

  // current exercise video url with YouTube embed support
  const currentVideoUrl = React.useMemo(() => {
    console.log('Current workout:', workout);
    console.log('Prepared workout data:', preparedWorkout);
    
    // First check if we have a video URL in the prepared workout
    if (preparedWorkout?.video_url) {
      console.log('Found video URL in prepared workout:', preparedWorkout.video_url);
      const embedUrl = getYoutubeEmbedUrl(preparedWorkout.video_url);
      if (embedUrl) {
        return `${embedUrl}&autoplay=1&modestbranding=1&rel=0`;
      }
    }
    
    // Fallback to exercise-specific videos if available
    if (workout && 'exercises' in workout && Array.isArray(workout.exercises) && workout.exercises.length > 0) {
      const currentExercise = workout.exercises[currentStep];
      const exerciseObj = currentExercise?.exercise;
      console.log('Current exercise:', exerciseObj);
      
      // Try to get a video URL from the current exercise
      const videoUrl = getBestVideoUrl(exerciseObj, selectedWod);
      if (videoUrl) {
        console.log('Found exercise video URL:', videoUrl);
        const embedUrl = getYoutubeEmbedUrl(videoUrl);
        if (embedUrl) {
          return `${embedUrl}&autoplay=1&modestbranding=1&rel=0`;
        }
      }
    }
    
    // Fallback to WOD video if available
    if (selectedWod) {
      console.log('Trying to get video from WOD');
      const wodVideoUrl = getBestVideoUrl(undefined, selectedWod);
      if (wodVideoUrl) {
        console.log('Found WOD video URL:', wodVideoUrl);
        const embedUrl = getYoutubeEmbedUrl(wodVideoUrl);
        if (embedUrl) {
          return `${embedUrl}&autoplay=1&modestbranding=1&rel=0`;
        }
      }
    }
    
    console.log('No video URL found in any source');
    return null;
  }, [workout, preparedWorkout, currentStep, selectedWod]);

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
        <div className="bg-background min-h-screen">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {lastSession && (
                <div className="text-sm text-muted-foreground">
                  Last done: {new Date(lastSession).toLocaleDateString()}
                </div>
              )}
            </div>

            {isInitializing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <h2 className="text-xl font-semibold">Loading Workout</h2>
                <p className="text-muted-foreground">Getting everything ready for you...</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-8">
                {/* Workout Header */}
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {workout ? workout.title : selectedWod?.name}
                  </h1>
                  <p className="text-muted-foreground">
                    {workout?.description || selectedWod?.description || 'Complete all exercises'}
                  </p>
                </div>

                {/* Timer and Progress */}
                <div className="bg-card rounded-xl p-6 shadow-sm border">
                  <div className="flex justify-between items-center mb-4">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        {phase === 'work' ? 'Current Exercise' : 'Rest'}
                      </span>
                      <h3 className="text-2xl font-bold">
                        {steps[currentStep]?.label || 'Workout Complete'}
                      </h3>
                      {steps[currentStep]?.detail && (
                        <p className="text-muted-foreground">{steps[currentStep]?.detail}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Time Elapsed</div>
                      <div className="text-4xl font-mono font-bold">
                        {formatTime(seconds)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted/30 h-3 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${phasePercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold">
                      {phase === 'work' ? 'Work' : 'Rest'} — {phaseRemaining}s
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {currentStep + 1} of {steps.length} exercises
                    </div>
                  </div>
                </div>

                {/* Video Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    {preparedWorkout?.title || 'Exercise'} Video
                  </h3>
                  <div className="bg-card rounded-xl p-4 border">
                    {currentVideoUrl ? (
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                          <iframe
                            className="w-full h-full"
                            src={currentVideoUrl}
                            title={`${preparedWorkout?.title || 'Exercise'} Demonstration`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            onError={(e) => {
                              console.error('Error loading video:', e);
                              // You might want to set a state to show an error message
                            }}
                          ></iframe>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video flex flex-col items-center justify-center bg-muted/30 rounded-lg p-6 text-center">
                        <Video className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground font-medium">
                          No video available for this {preparedWorkout ? 'workout' : 'exercise'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {preparedWorkout?.id 
                            ? 'This workout does not have an associated video.'
                            : 'This exercise does not have an associated video.'
                          }
                        </p>
                        {process.env.NODE_ENV === 'development' && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-md text-left text-xs">
                            <p className="font-mono">Debug Info:</p>
                            <p>Workout ID: {workout?.id || 'N/A'}</p>
                            <p>Prepared Workout: {preparedWorkout ? 'Loaded' : 'Not found'}</p>
                            <p>Video URL: {preparedWorkout?.video_url || 'Not set'}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Exercise Instructions */}
                    {steps[currentStep]?.detail && (
                      <div className="mt-4 p-4 bg-muted/10 rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">Instructions:</h4>
                        <div className="prose prose-sm prose-gray dark:prose-invert">
                          <p className="whitespace-pre-line">{steps[currentStep]?.detail}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Workout Description */}
                    {preparedWorkout?.description && !steps[currentStep]?.detail && (
                      <div className="mt-4 p-4 bg-muted/10 rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">Workout Description:</h4>
                        <div className="prose prose-sm prose-gray dark:prose-invert">
                          <p className="whitespace-pre-line">{preparedWorkout.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Workout Plan</h3>
                  <div className="space-y-2">
                    {steps.map((step: Step, idx: number) => (
                      <div
                        key={step.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          idx === currentStep
                            ? 'bg-primary/10 border-primary'
                            : idx < currentStep
                            ? 'bg-muted/50 border-muted/50'
                            : 'bg-card hover:bg-muted/30 border-muted'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">
                              {idx + 1}. {step.label}
                            </div>
                            {step.detail && (
                              <div className="text-sm text-muted-foreground">
                                {step.detail}
                              </div>
                            )}
                          </div>
                          {idx < currentStep && (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-white"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (currentStep > 0) {
                        setCurrentStep((s) => s - 1);
                        setPhase('work');
                        setPhaseRemaining(WORK_SEC);
                      }
                    }}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (phase === 'work') {
                        setPhase('rest');
                        setPhaseRemaining(REST_SEC);
                      } else {
                        setCurrentStep((s) => (s < steps.length - 1 ? s + 1 : s));
                        setPhase('work');
                        setPhaseRemaining(WORK_SEC);
                      }
                    }}
                  >
                    {phase === 'work' ? 'Skip to Rest' : 'Next Exercise'}
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleFinish}
                  >
                    Finish Workout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
};

export default WorkoutPlayer;
