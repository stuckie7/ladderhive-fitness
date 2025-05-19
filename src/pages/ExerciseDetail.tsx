
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
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Exercise } from '@/types/exercise';

export default function ExerciseDetail() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddToWorkoutOpen, setIsAddToWorkoutOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const handleAddToWorkout = () => {
    setIsAddToWorkoutOpen(true);
  };

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const exerciseData = await getExerciseFullById(id);
        setExercise(exerciseData);
      } catch (error) {
        console.error('Error fetching exercise details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!exercise) {
    return <div>Exercise not found</div>;
  }

  const exerciseId = exercise.id.toString();
  const exerciseName = exercise.name;

  return (
    <div className="container mx-auto py-8">
      <DynamicBreadcrumb />
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <ExerciseHeader
            exercise={exercise}
            onBackClick={() => navigate(-1)}
            onAddToWorkout={handleAddToWorkout}
          />
          <ExerciseMainContent exercise={exercise} />
        </div>
        <div className="w-full md:w-80">
          <ExerciseSidebarContent exercise={exercise} loading={loading} />
        </div>
      </div>
      <AddToWorkoutModal
        open={isAddToWorkoutOpen}
        onOpenChange={setIsAddToWorkoutOpen}
        exerciseId={exerciseId}
        exerciseName={exerciseName}
      />
    </div>
  );
}

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const exerciseId = typeof id === 'string' && !isNaN(parseInt(id)) 
          ? parseInt(id, 10) 
          : id;
        const fullExercise = await getExerciseFullById(exerciseId);
        
        if (fullExercise) {
          console.log('Found exercise in enhanced library:', fullExercise);
          
          // Create compatible Exercise object from ExerciseFull
          const exerciseData: Exercise = {
            id: fullExercise.id,
            name: fullExercise.name,
            description: fullExercise.description || '',
            muscle_group: fullExercise.prime_mover_muscle || '',
            equipment: fullExercise.primary_equipment || '',
            difficulty: fullExercise.difficulty || '',
            instructions: fullExercise.instructions || [],
            video_url: fullExercise.video_url || '',
            image_url: fullExercise.image_url || '',
            bodyPart: fullExercise.body_region || '',
            target: fullExercise.prime_mover_muscle || '',
            secondaryMuscles: [
              fullExercise.secondary_muscle || '',
              fullExercise.tertiary_muscle || ''
            ].filter(Boolean),
            equipment_needed: fullExercise.primary_equipment || '',
            video_demonstration_url: fullExercise.short_youtube_demo || '',
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

          // Update exercise data to use video_explanation_url and remove thumbnail
          exerciseData.youtube_thumbnail_url = undefined;
          if (exerciseData.video_explanation_url) {
            exerciseData.video_url = exerciseData.video_explanation_url;
          } else if (exerciseData.short_youtube_demo) {
            exerciseData.video_url = exerciseData.short_youtube_demo;
          }

          setExercise(exerciseData);
        } 
        // If not found in exercises_full, try regular exercises table
        else {
          console.log('Exercise not found in enhanced library, trying exercises table');
          
          let { data, error } = await supabase
            .from('exercises')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) {
            console.error('Error fetching exercise:', error);
            throw error;
          }
          
          if (data) {
            console.log('Found exercise in exercises table:', data);
            // Transform the raw data to match our Exercise type
            const exerciseData: Exercise = {
              id: data.id,
              name: data.name,
              description: data.description || '',
              muscle_group: data.muscle_group || '',
              equipment: data.equipment || '',
              difficulty: data.difficulty || '',
              instructions: data.instructions ? [data.instructions] : [],
              video_url: data.video_url || '',
              image_url: data.image_url || '',
              bodyPart: data.muscle_group || '',
              target: data.muscle_group || '',
            };
            
            setExercise(exerciseData);
          } else {
            console.log('Exercise not found in either table');
            setExercise(null);
          }
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

  const handleBackClick = () => {
    navigate('/exercises');
  };

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
            <ExerciseSidebarContent exercise={exercise} />
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
