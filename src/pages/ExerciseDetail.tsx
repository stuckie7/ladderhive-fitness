
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Exercise, ExerciseFull } from '@/types/exercise';
import { getEmbeddedYoutubeUrl } from '@/components/exercises/exercise-detail/ExerciseMainDetails';
import { supabase } from '@/integrations/supabase/client';
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
export default function ExerciseDetail() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddToWorkoutOpen, setIsAddToWorkoutOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Exercise ID from URL:', id);
  }, [id]);

  const handleAddToWorkout = () => {
    setIsAddToWorkoutOpen(true);
  };

  const handleBackClick = () => {
    navigate('/exercises');
  };

  useEffect(() => {
    if (!id) {
      console.error('No exercise ID provided in URL');
      setExercise(null);
      setLoading(false);
      return;
    }

    const fetchExerciseDetails = async () => {
      setLoading(true);
      try {
        console.log('Fetching exercise with ID:', id);
        
        // Try fetching from exercises_full first
        const { data: fullExercise, error: fullError } = await supabase
          .from('exercises_full')
          .select('*')
          .eq('id', id)
          .single();

        if (fullError) {
          console.error('Error fetching from exercises_full:', fullError);
        } else if (fullExercise) {
          console.log('Found exercise in exercises_full:', fullExercise);
          
          // Create compatible Exercise object from ExerciseFull
          const exerciseData: Exercise = {
            id: fullExercise.id,
            name: fullExercise.name,
            description: fullExercise.description || '',
            muscle_group: fullExercise.prime_mover_muscle || '',
            equipment: fullExercise.primary_equipment || '',
            difficulty: fullExercise.difficulty || '',
            instructions: Array.isArray(fullExercise.instructions) 
              ? fullExercise.instructions 
              : [fullExercise.instructions || ''],
            video_url: fullExercise.video_url || '',
            image_url: fullExercise.image_url || '',
            bodyPart: fullExercise.body_region || '',
            target: fullExercise.prime_mover_muscle || '',
            secondaryMuscles: [
              fullExercise.secondary_muscle || '',
              fullExercise.tertiary_muscle || ''
            ].filter(Boolean),
            equipment_needed: fullExercise.primary_equipment || '',
            video_demonstration_url: fullExercise.video_demonstration_url || '',
            video_explanation_url: fullExercise.video_explanation_url || '',
            youtube_thumbnail_url: fullExercise.youtube_thumbnail_url || '',
            body_region: fullExercise.body_region || '',
            mechanics: fullExercise.mechanics || '',
            force_type: fullExercise.force_type || '',
            posture: fullExercise.posture || '',
            laterality: fullExercise.laterality || '',
            short_youtube_demo: fullExercise.short_youtube_demo || '',
            in_depth_youtube_exp: fullExercise.in_depth_youtube_exp || '',
          };

            // Set video_url based on available video URLs in priority order
            const videoUrls = [
              fullExercise.in_depth_youtube_exp || '',
              fullExercise.short_youtube_demo || '',
              fullExercise.video_explanation_url || '',
              fullExercise.video_demonstration_url || '',
              fullExercise.video_url || ''
            ].filter(url => url);
            
            exerciseData.video_url = videoUrls[0] || '';

          setExercise(exerciseData);
          return;
        }

        // If not found in exercises_full, try regular exercises table
        console.log('Exercise not found in exercises_full, trying exercises table');
        
        const { data: baseExercise, error: baseError } = await supabase
          .from('exercises')
          .select('*')
          .eq('id', id)
          .single();

        if (baseError) {
          console.error('Error fetching from exercises:', baseError);
          throw baseError;
        }

        if (baseExercise) {
          console.log('Found exercise in exercises table:', baseExercise);
          // Transform the raw data to match our Exercise type
          const exerciseData: Exercise = {
            id: baseExercise.id,
            name: baseExercise.name,
            description: baseExercise.description || '',
            muscle_group: baseExercise.muscle_group || '',
            equipment: baseExercise.equipment || '',
            difficulty: baseExercise.difficulty || '',
            instructions: baseExercise.instructions ? [baseExercise.instructions] : [],
            video_url: baseExercise.video_url || '',
            image_url: baseExercise.image_url || '',
            bodyPart: baseExercise.muscle_group || '',
            target: baseExercise.muscle_group || '',
            secondaryMuscles: [],
            equipment_needed: baseExercise.equipment || '',
            video_demonstration_url: baseExercise.video_demonstration_url || '',
            video_explanation_url: baseExercise.video_explanation_url || '',
            youtube_thumbnail_url: baseExercise.youtube_thumbnail_url || '',
            body_region: baseExercise.muscle_group || '',
            mechanics: baseExercise.mechanics || '',
            force_type: baseExercise.force_type || '',
            posture: baseExercise.posture || '',
            laterality: baseExercise.laterality || '',
            short_youtube_demo: baseExercise.short_youtube_demo || '',
            in_depth_youtube_exp: baseExercise.in_depth_youtube_exp || '',
          };

            // Set video_url based on available video URLs in priority order
            const videoUrls = [
              baseExercise.video_url || '',
              baseExercise.video_explanation_url || '',
              baseExercise.video_demonstration_url || '',
              baseExercise.short_youtube_demo || '',
              baseExercise.in_depth_youtube_exp || ''
            ].filter(url => url);
            
            exerciseData.video_url = videoUrls[0] || '';
          
          setExercise(exerciseData);
        } else {
          console.log('Exercise not found in either table');
          setExercise(null);
        }
      } catch (error) {
        console.error('Error fetching exercise:', error);
        setExercise(null);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4">Loading exercise details...</p>
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading exercise details...</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <Info className="h-6 w-6 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Exercise not found or error occurred</p>
      </div>
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
        
        {/* AddToWorkoutModal */}
        {exercise && (
          <AddToWorkoutModal
            open={isAddToWorkoutOpen}
            onOpenChange={setIsAddToWorkoutOpen}
            exerciseId={exercise.id.toString()}
            exerciseName={exercise.name}
          />
        )}
  
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
                          src={getEmbeddedYoutubeUrl(exercise.in_depth_youtube_exp)} 
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
      {exercise && (
        <AddToWorkoutModal
          open={isAddToWorkoutOpen}
          onOpenChange={setIsAddToWorkoutOpen}
          exerciseId={exercise.id.toString()}
          exerciseName={exercise.name}
        />
      )}
    </AppLayout>
  );
}
