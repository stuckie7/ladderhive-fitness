
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useAltWorkoutDetail } from '@/hooks/workouts/use-alt-workout-detail';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock, Dumbbell, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const AltWorkoutDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workout, isLoading, error } = useAltWorkoutDetail(id);
  
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [restMode, setRestMode] = useState(false);
  const [restTimer, setRestTimer] = useState(0);

  // Helper function to mark exercise complete
  const handleExerciseComplete = (exerciseId: string) => {
    if (!completedExercises.includes(exerciseId)) {
      setCompletedExercises([...completedExercises, exerciseId]);
    } else {
      setCompletedExercises(completedExercises.filter(id => id !== exerciseId));
    }
  };

  // Start rest timer
  const startRest = (exerciseId: string, restSeconds: number) => {
    setActiveExerciseId(exerciseId);
    setRestMode(true);
    setRestTimer(restSeconds);
  };

  // Handle rest timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (restMode && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => prev - 1);
      }, 1000);
    } else if (restTimer === 0 && restMode) {
      setRestMode(false);
    }
    
    return () => clearInterval(interval);
  }, [restMode, restTimer]);
  
  // Back button handler
  const handleBack = () => {
    navigate(-1);
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress percentage
  const progressPercentage = workout && workout.exercises.length > 0
    ? (completedExercises.length / workout.exercises.length) * 100
    : 0;

  // Calculate difficulty style
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" className="mb-6" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-96" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Error Loading Workout</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={handleBack}>
              Return to Workouts
            </Button>
          </div>
        ) : workout ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{workout.title}</h1>
              <div className="flex flex-wrap gap-2 items-center mb-4">
                <Badge 
                  variant="outline" 
                  className={getDifficultyColor(workout.difficulty)}
                >
                  {workout.difficulty}
                </Badge>
                {workout.category && (
                  <Badge variant="secondary">
                    {workout.category}
                  </Badge>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  {workout.duration_minutes} min
                </div>
              </div>
              
              {workout.description && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <p className="text-md">{workout.description}</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">{completedExercises.length}/{workout.exercises.length} exercises</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            {/* Exercise List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Exercises</h2>
              
              {workout.exercises.map((exercise, index) => (
                <Card 
                  key={exercise.id} 
                  className={`overflow-hidden transition-colors ${
                    completedExercises.includes(exercise.id) 
                      ? 'bg-muted/30 dark:bg-muted/20' 
                      : ''
                  }`}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="w-6 h-6 rounded-full flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        <CardTitle className="text-lg">{exercise.exercise?.name || 'Unknown Exercise'}</CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={completedExercises.includes(exercise.id) ? 'text-green-600' : ''}
                        onClick={() => handleExerciseComplete(exercise.id)}
                      >
                        <Check className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0">
                    {/* Video player */}
                    {exercise.exercise?.video_url && (
                      <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                        <video
                          src={exercise.exercise.video_url}
                          className="w-full h-full object-cover"
                          poster={exercise.exercise.thumbnail_url}
                          controls
                        />
                      </div>
                    )}
                    
                    {/* Exercise details */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Sets</span>
                        <span className="font-medium">{exercise.sets}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Reps</span>
                        <span className="font-medium">{exercise.reps}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Rest</span>
                        <span className="font-medium">{exercise.rest_seconds} sec</span>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    {exercise.notes && (
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <span className="text-sm font-medium block mb-1">Trainer notes:</span>
                        <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                      </div>
                    )}
                    
                    {/* Rest timer */}
                    <div className="mt-4 flex gap-2">
                      {activeExerciseId === exercise.id && restMode ? (
                        <div className="w-full">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Rest Time</span>
                            <span className="text-sm font-bold">{formatTime(restTimer)}</span>
                          </div>
                          <Progress value={(restTimer / exercise.rest_seconds) * 100} className="h-2" />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 w-full"
                            onClick={() => setRestMode(false)}
                          >
                            Skip Rest
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => startRest(exercise.id, exercise.rest_seconds)}
                        >
                          Start Rest Timer ({exercise.rest_seconds}s)
                        </Button>
                      )}
                      <Button 
                        variant={completedExercises.includes(exercise.id) ? "outline" : "default"}
                        className={`${completedExercises.includes(exercise.id) ? '' : 'bg-fitness-primary hover:bg-fitness-primary/90'}`}
                        onClick={() => handleExerciseComplete(exercise.id)}
                      >
                        {completedExercises.includes(exercise.id) ? 'Completed' : 'Complete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Workout completion */}
            {completedExercises.length === workout.exercises.length && completedExercises.length > 0 && (
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
                    <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Workout Completed!</h3>
                    <p className="text-sm text-muted-foreground">Great job finishing this workout</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Workout Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The workout you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBack}>
              Return to Workouts
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AltWorkoutDetail;
