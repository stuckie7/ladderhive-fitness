
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { Exercise } from '@/types/exercise';
import AppLayout from '@/components/layout/AppLayout';

// Import refactored components
import ExerciseHeader from '@/components/exercises/exercise-detail/ExerciseHeader';
import ExerciseDetailSkeleton from '@/components/exercises/exercise-detail/ExerciseDetailSkeleton';
import ExerciseNotFound from '@/components/exercises/exercise-detail/ExerciseNotFound';
import ExerciseMainContent from '@/components/exercises/exercise-detail/ExerciseMainContent';
import ExerciseSidebarContent from '@/components/exercises/exercise-detail/ExerciseSidebarContent';

export default function ExerciseDetail() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  // Helper function to map database fields to Exercise interface
  const mapToExercise = (data: any, fromNewTable: boolean): Exercise => {
    if (fromNewTable) {
      return {
        id: data.id,
        name: data.name,
        bodyPart: data.body_region || '',
        target: data.target_muscle_group || '',
        equipment: data.primary_equipment || '',
        secondaryMuscles: data.secondary_muscle ? [data.secondary_muscle] : [],
        instructions: data.instructions ? 
          (Array.isArray(data.instructions) ? data.instructions : [data.instructions]) : [],
        gifUrl: data.image_url,
        // Map fields from exercises_new
        target_muscle_group: data.target_muscle_group,
        primary_equipment: data.primary_equipment,
        secondary_equipment: data.secondary_equipment,
        posture: data.posture,
        laterality: data.laterality,
        video_demonstration_url: data.video_demonstration_url,
        video_explanation_url: data.video_explanation_url,
        difficulty_level: data.difficulty_level,
        body_region: data.body_region,
        exercise_classification: data.exercise_classification,
        mechanics: data.mechanics,
        force_type: data.force_type,
        prime_mover_muscle: data.prime_mover_muscle,
        // Legacy fields for compatibility
        muscle_group: data.body_region || data.target_muscle_group,
        description: data.description,
        difficulty: data.difficulty_level,
        video_url: data.video_explanation_url || data.video_demonstration_url,
        image_url: data.image_url
      };
    } else {
      return {
        id: data.id,
        name: data.name,
        bodyPart: data.muscle_group || '',
        target: data.muscle_group || '',
        equipment: data.equipment || '',
        instructions: data.instructions ? 
          (Array.isArray(data.instructions) ? data.instructions : data.instructions.split('\n')) : [],
        gifUrl: data.image_url,
        // Legacy fields
        muscle_group: data.muscle_group,
        description: data.description,
        difficulty: data.difficulty,
        video_url: data.video_url,
        image_url: data.image_url
      } as Exercise; // Cast to Exercise to handle missing fields
    }
  };

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // Try exercises_new first
        let { data, error } = await supabase
          .from('exercises_new')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          // Fallback to exercises table
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('exercises')
            .select('*')
            .eq('id', id)
            .single();
            
          if (fallbackError) throw fallbackError;
          setExercise(mapToExercise(fallbackData, false));
        } else {
          setExercise(mapToExercise(data, true));
        }
      } catch (error) {
        console.error('Error fetching exercise:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [id]);

  const handleBackClick = () => {
    navigate('/exercises');
  };

  if (loading) {
    return (
      <AppLayout>
        <ExerciseDetailSkeleton onBackClick={handleBackClick} />
      </AppLayout>
    );
  }

  if (!exercise) {
    return (
      <AppLayout>
        <ExerciseNotFound onBackClick={handleBackClick} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <ExerciseDetailSkeleton onBackClick={handleBackClick} />
        ) : !exercise ? (
          <ExerciseNotFound onBackClick={handleBackClick} />
        ) : (
          <>
            <ExerciseHeader exercise={exercise} onBackClick={handleBackClick} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ExerciseMainContent exercise={exercise} />
              <ExerciseSidebarContent exercise={exercise} />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
