
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Exercise } from '@/types/exercise';
import { supabase } from '@/integrations/supabase/client';

// Components
import ExerciseHeader from '@/components/exercises/exercise-detail/ExerciseHeader';
import ExerciseMainContent from '@/components/exercises/exercise-detail/ExerciseMainContent';
import ExerciseSidebarContent from '@/components/exercises/exercise-detail/ExerciseSidebarContent';

export default function ExerciseDetail() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        let { data, error } = await supabase
          .from('exercises')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Transform the raw data to match our Exercise type
          const exerciseData: Exercise = {
            id: data.id,
            name: data.name,
            description: data.description,
            muscle_group: data.muscle_group,
            equipment: data.equipment,
            difficulty: data.difficulty,
            instructions: data.instructions ? [data.instructions] : [],
            video_url: data.video_url,
            image_url: data.image_url
          };
          
          setExercise(exerciseData);
        }
      } catch (error) {
        console.error('Error fetching exercise:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [id]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <ExerciseHeader exercise={exercise} loading={loading} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Main content takes up 2/3 of the container on medium+ screens */}
          <div className="md:col-span-2">
            <ExerciseMainContent exercise={exercise} loading={loading} />
          </div>
          
          {/* Sidebar content takes up 1/3 of the container on medium+ screens */}
          <div className="md:col-span-1">
            <ExerciseSidebarContent exercise={exercise} loading={loading} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
