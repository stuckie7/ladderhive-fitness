// src/pages/ExerciseDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/lib/supabase'; // Assuming supabase is used for fetching
import { ExerciseFull } from '@/types/exercise'; // Assuming this type exists
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const ExerciseDetailPage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const [exercise, setExercise] = useState<ExerciseFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!exerciseId) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('exercises_full') // Assuming a view or table named 'exercises_full'
          .select('*')
          .eq('id', exerciseId)
          .single();

        if (dbError) throw dbError;
        setExercise(data);
      } catch (err: any) {
        console.error('Error fetching exercise details:', err);
        setError(err.message || 'Failed to load exercise details.');
      }
      setLoading(false);
    };

    fetchExerciseDetails();
  }, [exerciseId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading exercise details...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  if (!exercise) {
    return (
      <AppLayout>
        <Alert>
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Exercise not found.</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  // Basic display of exercise details
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">{exercise.name}</h1>
        
        {exercise.short_youtube_demo && (
          <div className="mb-6 aspect-video max-w-2xl mx-auto">
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${exercise.short_youtube_demo.split('v=')[1]?.split('&')[0] || exercise.short_youtube_demo.split('/').pop()}`}
              title={exercise.name || 'Exercise Video'}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <p><strong>Primary Muscle:</strong> {exercise.prime_mover_muscle || 'N/A'}</p>
            <p><strong>Secondary Muscles:</strong> {exercise.secondary_movers?.join(', ') || 'N/A'}</p>
            <p><strong>Equipment:</strong> {exercise.primary_equipment || 'N/A'}</p>
            <p><strong>Mechanics:</strong> {exercise.mechanics || 'N/A'}</p>
            <p><strong>Force:</strong> {exercise.force || 'N/A'}</p>
            <p><strong>Difficulty:</strong> {exercise.difficulty_level || 'N/A'}</p>
          </div>
          {exercise.instructions && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Instructions</h2>
              <div className="prose max-w-none">
                {exercise.instructions.split('\n').map((step, index) => (
                  <p key={index}>{step}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add more details as needed */}
      </div>
    </AppLayout>
  );
};

export default ExerciseDetailPage;
