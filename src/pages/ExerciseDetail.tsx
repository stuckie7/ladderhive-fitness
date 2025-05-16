
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Exercise, ExerciseFull } from '@/types/exercise';
import { supabase } from '@/integrations/supabase/client';
import { getExerciseFullById } from '@/hooks/exercise-library/services/exercise-detail-service';
import { DynamicBreadcrumb } from '@/components/ui/dynamic-breadcrumb';

// Components
import ExerciseHeader from '@/components/exercises/exercise-detail/ExerciseHeader';
import ExerciseMainContent from '@/components/exercises/exercise-detail/ExerciseMainContent';
import ExerciseSidebarContent from '@/components/exercises/exercise-detail/ExerciseSidebarContent';

export default function ExerciseDetail() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        console.log(`Fetching exercise with ID: ${id}`);
        
        // Try fetching from enhanced service first
        const fullExercise = await getExerciseFullById(id);
        
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
            video_url: fullExercise.short_youtube_demo || fullExercise.video_demonstration_url || '',
            image_url: fullExercise.youtube_thumbnail_url || fullExercise.image_url || '',
            bodyPart: fullExercise.body_region || '',
            target: fullExercise.prime_mover_muscle || '',
            secondaryMuscles: fullExercise.secondary_muscle ? [fullExercise.secondary_muscle] : [],
            prime_mover_muscle: fullExercise.prime_mover_muscle,
            secondary_muscle: fullExercise.secondary_muscle,
            tertiary_muscle: fullExercise.tertiary_muscle,
            primary_equipment: fullExercise.primary_equipment,
            secondary_equipment: fullExercise.secondary_equipment,
            body_region: fullExercise.body_region,
            mechanics: fullExercise.mechanics,
            force_type: fullExercise.force_type,
            posture: fullExercise.posture,
            laterality: fullExercise.laterality,
            youtube_thumbnail_url: fullExercise.youtube_thumbnail_url
          };
          
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
      <div className="container mx-auto px-4 py-8">
        <DynamicBreadcrumb onBack={handleBackClick} className="mb-6" />
        
        <ExerciseHeader 
          exercise={exercise} 
          onBackClick={handleBackClick} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Main content takes up 2/3 of the container on medium+ screens */}
          <div className="md:col-span-2">
            <ExerciseMainContent 
              exercise={exercise} 
              loading={loading} 
            />
          </div>
          
          {/* Sidebar content takes up 1/3 of the container on medium+ screens */}
          <div className="md:col-span-1">
            <ExerciseSidebarContent 
              exercise={exercise} 
              loading={loading} 
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
