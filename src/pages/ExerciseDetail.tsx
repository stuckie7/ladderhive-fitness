
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Exercise, ExerciseFull } from '@/types/exercise';

import { getExerciseById } from '@/hooks/exercise-library/services/exercise-detail-service';
import { getExerciseFullById } from '@/hooks/exercise-library/services/exercise-detail-service';
import { DynamicBreadcrumb } from '@/components/ui/dynamic-breadcrumb';
import { ChevronLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddToWorkoutModal from '@/components/exercises/AddToWorkoutModal';
import ExerciseHeader from '@/components/exercises/exercise-detail/ExerciseHeader';
import ExerciseMainContent from '@/components/exercises/exercise-detail/ExerciseMainContent';
import ExerciseSidebarContent from '@/components/exercises/exercise-detail/ExerciseSidebarContent';

/**
 * Displays the details of a specific exercise, including its main content and sidebar information.
 * Allows users to navigate back to the previous page or add the exercise to a workout.
 * Fetches exercise details based on the `id` parameter from the URL.
 * Shows loading state while data is being fetched and handles errors gracefully.
 */
export default function ExerciseDetail(): JSX.Element {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddToWorkoutOpen, setIsAddToWorkoutOpen] = useState(false);
  const { id } = useParams<{ id: string | undefined }>();
  const numericId = id ? parseInt(id) : undefined;
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleAddToWorkout = () => {
    setIsAddToWorkoutOpen(true);
  };

  useEffect(() => {
    const fetchExercise = async () => {
      if (!id) {
        console.error('No exercise ID provided in URL');
        setExercise(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const exercise = await getExerciseById(id);
        setExercise(exercise);
      } catch (err) {
        console.error('Error fetching exercise:', err);
        setExercise(null);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="px-0 py-4 md:px-4 md:py-6">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackClick}
              className="gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-card animate-pulse rounded-lg"></div>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <div className="h-16 bg-muted rounded animate-pulse"></div>
              <div className="h-16 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!exercise) {
    return (
      <AppLayout>
        <div className="px-0 py-4 md:px-4 md:py-6">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackClick}
              className="gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <Info className="h-6 w-6 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Exercise not found or error occurred</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-0 py-4 md:px-4 md:py-6">
        {/* Back button & breadcrumbs */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackClick}
            className="gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Dashboard
          </Button>
        </div>
        
        {/* Exercise header with title and basic info */}
        <div className="mb-8">
          <ExerciseHeader 
            exercise={exercise} 
            onBackClick={handleBackClick} 
            onAddToWorkout={handleAddToWorkout}
          />
        </div>
        
        {/* Main content with tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="h-64 bg-card animate-pulse rounded-lg"></div>
            ) : exercise ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  {exercise.in_depth_youtube_exp && (
                    <TabsTrigger value="video">Video</TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <div className="space-y-6">
                    {/* Main Content */}
                    <ExerciseMainContent 
                      exercise={exercise} 
                      loading={loading} 
                    />
                  </div>
                </TabsContent>
                {exercise.in_depth_youtube_exp && (
                  <TabsContent value="video">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium mb-4">In-Depth Video Explanation</h3>
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        <iframe 
                          src={exercise.in_depth_youtube_exp}
                          title="In-Depth Explanation"
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            ) : (
              <div className="bg-muted/30 rounded-lg p-6 flex items-center justify-center">
                <p className="text-muted-foreground">Exercise not found</p>
              </div>
            )}
          </div>
          
          {/* Sidebar - 1/3 width on large screens */}
          <div className="col-span-12 md:col-span-4">
            <ExerciseSidebarContent exercise={exercise} loading={loading} />
            <Button
              onClick={handleAddToWorkout}
              className="w-full mt-4 bg-primary text-white"
            >
              Add to Workout
            </Button>
          </div>
        </div>
      </div>
      {isAddToWorkoutOpen && exercise && (
        <AddToWorkoutModal
          exercise={exercise}
          isOpen={isAddToWorkoutOpen}
          onClose={() => setIsAddToWorkoutOpen(false)}
        />
      )}
    </AppLayout>
  );
}
