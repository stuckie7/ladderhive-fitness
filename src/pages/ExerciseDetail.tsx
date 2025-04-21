import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { Exercise } from '@/types/exercise';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExerciseDetail() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();

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
        video_url: data.video_explanation_url,
        video_demonstration_url: data.video_demonstration_url,
        difficulty: data.difficulty_level as 'Beginner' | 'Intermediate' | 'Advanced',
        // Additional fields
        ...data // Spread all other fields that match exactly
      };
    } else {
      return {
        id: data.id,
        name: data.name,
        bodyPart: data.muscle_group || '',
        target: data.muscle_group || '',
        equipment: data.equipment || '',
        instructions: data.instructions ? 
          (Array.isArray(data.instructions) ? data.instructions : data.instructions.split('\n') : [],
        gifUrl: data.image_url,
        video_url: data.video_url,
        difficulty: data.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
        // Map legacy fields
        muscle_group: data.muscle_group,
        description: data.description
      };
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

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!exercise) {
    return <NotFoundView />;
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <ExerciseHeader exercise={exercise} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MainContent exercise={exercise} />
          <SidebarContent exercise={exercise} />
        </div>
      </div>
    </AppLayout>
  );
}

// Sub-components for better organization
const LoadingSkeleton = () => (
  <AppLayout>
    <div className="container mx-auto px-4 py-6">
      <Skeleton className="h-12 w-3/4 mb-4" />
      <Skeleton className="h-64 mb-4" />
      <Skeleton className="h-32 mb-4" />
      <Skeleton className="h-32" />
    </div>
  </AppLayout>
);

const NotFoundView = () => (
  <AppLayout>
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Exercise Not Found</h1>
      <p>The exercise you are looking for does not exist or has been removed.</p>
    </div>
  </AppLayout>
);

const ExerciseHeader = ({ exercise }: { exercise: Exercise }) => (
  <div className="flex flex-col md:flex-row justify-between items-start mb-6">
    <div>
      <h1 className="text-3xl font-bold mb-2">{exercise.name}</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {exercise.bodyPart && <Badge variant="outline">{exercise.bodyPart}</Badge>}
        {exercise.target && exercise.target !== exercise.bodyPart && (
          <Badge variant="outline">{exercise.target}</Badge>
        )}
        {exercise.equipment && <Badge variant="secondary">{exercise.equipment}</Badge>}
        {exercise.difficulty && (
          <Badge className={`
            ${exercise.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' : ''}
            ${exercise.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${exercise.difficulty === 'Advanced' ? 'bg-red-100 text-red-800' : ''}
            dark:bg-${exercise.difficulty.toLowerCase()}-900 dark:text-${exercise.difficulty.toLowerCase()}-300
          `}>
            {exercise.difficulty}
          </Badge>
        )}
      </div>
    </div>
  </div>
);

const MainContent = ({ exercise }: { exercise: Exercise }) => (
  <div className="lg:col-span-2">
    <Card>
      <CardHeader>
        <CardTitle>Exercise Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="description">
          <TabsList className="mb-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            {(exercise.video_url || exercise.video_demonstration_url) && (
              <TabsTrigger value="video">Video</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="description">
            <p className="text-muted-foreground">
              {exercise.description || 'No description available for this exercise.'}
            </p>
          </TabsContent>
          
          <TabsContent value="instructions">
            {exercise.instructions?.length ? (
              <div>
                {exercise.instructions.map((instruction, index) => (
                  <p key={index} className="mb-2">{instruction}</p>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No instructions available.</p>
            )}
          </TabsContent>
          
          {(exercise.video_url || exercise.video_demonstration_url) && (
            <TabsContent value="video">
              <div className="aspect-video relative overflow-hidden rounded-md">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src={(exercise.video_url || exercise.video_demonstration_url)?.replace('watch?v=', 'embed/')}
                  title={`${exercise.name} demonstration`}
                  allowFullScreen
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  </div>
);

const SidebarContent = ({ exercise }: { exercise: Exercise }) => (
  <div>
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Exercise Image</CardTitle>
      </CardHeader>
      <CardContent>
        {exercise.gifUrl ? (
          <div className="aspect-square rounded-md overflow-hidden">
            <img 
              src={exercise.gifUrl} 
              alt={exercise.name}
              className="object-cover w-full h-full" 
            />
          </div>
        ) : (
          <div className="aspect-square rounded-md bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">No image available</p>
          </div>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          {exercise.mechanics && <SpecItem label="Mechanics" value={exercise.mechanics} />}
          {exercise.force_type && <SpecItem label="Force Type" value={exercise.force_type} />}
          {exercise.posture && <SpecItem label="Posture" value={exercise.posture} />}
          {exercise.laterality && <SpecItem label="Laterality" value={exercise.laterality} />}
          {exercise.secondaryMuscles?.length && (
            <SpecItem label="Secondary Muscles" value={exercise.secondaryMuscles.join(', ')} />
          )}
          {exercise.tertiary_muscle && <SpecItem label="Tertiary Muscles" value={exercise.tertiary_muscle} />}
        </dl>
      </CardContent>
    </Card>
  </div>
);

const SpecItem = ({ label, value }: { label: string; value: string }) => (
  <>
    <dt className="font-medium">{label}:</dt>
    <dd className="text-muted-foreground">{value}</dd>
  </>
);
