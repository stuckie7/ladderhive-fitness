
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        console.log(`Fetching exercise with ID: ${id}`);
        
        // Try fetching from exercises_full first (more detailed data)
        let { data: fullData, error: fullError } = await supabase
          .from('exercises_full')
          .select('*')
          .eq('id', parseInt(id, 10))
          .single();

        if (fullData) {
          console.log('Found exercise in exercises_full:', fullData);
          // Map the full exercise data to our Exercise type
          const exerciseData: Exercise = {
            id: fullData.id.toString(),
            name: fullData.name || '',
            description: (fullData as any).description || `${fullData.prime_mover_muscle || ''} exercise using ${fullData.primary_equipment || 'bodyweight'}`,
            muscle_group: fullData.prime_mover_muscle || '',
            equipment: fullData.primary_equipment || '',
            difficulty: fullData.difficulty || '',
            instructions: (fullData as any).instructions ? [(fullData as any).instructions] : [],
            video_url: fullData.short_youtube_demo || '',
            image_url: fullData.youtube_thumbnail_url || '',
            bodyPart: fullData.body_region || '',
            target: fullData.prime_mover_muscle || '',
            secondaryMuscles: fullData.secondary_muscle ? [fullData.secondary_muscle] : [],
            gifUrl: fullData.youtube_thumbnail_url || '',
            mechanics: fullData.mechanics || '',
            force_type: fullData.force_type || '',
            posture: fullData.posture || '',
            laterality: fullData.laterality || '',
            tertiary_muscle: fullData.tertiary_muscle || '',
            video_demonstration_url: (fullData as any).video_demonstration_url || fullData.short_youtube_demo || '',
            youtube_thumbnail_url: fullData.youtube_thumbnail_url || '',
          };
          
          setExercise(exerciseData);
        } 
        // If not found in exercises_full, try regular exercises table
        else {
          console.log('Exercise not found in exercises_full, trying exercises table');
          
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
              name: data.name || '',
              description: data.description || '',
              muscle_group: data.muscle_group || '',
              equipment: data.equipment || '',
              difficulty: data.difficulty || '',
              instructions: data.instructions ? [data.instructions] : [],
              video_url: data.video_url || '',
              image_url: data.image_url || '',
              bodyPart: data.muscle_group || '',
              target: data.muscle_group || '',
              youtube_thumbnail_url: data.image_url || '',
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
    navigate('/exercise-library');
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
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
