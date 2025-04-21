
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

  // Fetch exercise details from Supabase
  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // First try to get from exercises_new table (preferred)
        let { data, error } = await supabase
          .from('exercises_new')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          // If not found, try the exercises table as fallback
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('exercises')
            .select('*')
            .eq('id', id)
            .single();
            
          if (fallbackError) {
            console.error('Error fetching exercise:', fallbackError);
            return;
          }
          
          data = fallbackData;
        }
        
        setExercise(data);
      } catch (error) {
        console.error('Error fetching exercise details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 mb-4" />
          <Skeleton className="h-32 mb-4" />
          <Skeleton className="h-32" />
        </div>
      </AppLayout>
    );
  }

  if (!exercise) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">Exercise Not Found</h1>
          <p>The exercise you are looking for does not exist or has been removed.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{exercise.name}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {exercise.muscle_group && (
                <Badge variant="outline">{exercise.muscle_group}</Badge>
              )}
              {exercise.target_muscle_group && (
                <Badge variant="outline">{exercise.target_muscle_group}</Badge>
              )}
              {exercise.equipment && (
                <Badge variant="secondary">{exercise.equipment}</Badge>
              )}
              {exercise.primary_equipment && (
                <Badge variant="secondary">{exercise.primary_equipment}</Badge>
              )}
              {exercise.difficulty && (
                <Badge className={`
                  ${exercise.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                  ${exercise.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                  ${exercise.difficulty === 'Advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : ''}
                `}>
                  {exercise.difficulty}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Exercise Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    {(exercise.video_url || exercise.video_demonstration_url) && (
                      <TabsTrigger value="video">Video</TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="description">
                    {exercise.description ? (
                      <p className="text-muted-foreground">{exercise.description}</p>
                    ) : (
                      <p className="text-muted-foreground">No description available for this exercise.</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="instructions">
                    {exercise.instructions ? (
                      <div>
                        {exercise.instructions.split('\n').map((instruction, index) => (
                          <p key={index} className="mb-2">{instruction}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No instructions available for this exercise.</p>
                    )}
                  </TabsContent>
                  
                  {(exercise.video_url || exercise.video_demonstration_url) && (
                    <TabsContent value="video">
                      <div className="aspect-video relative overflow-hidden rounded-md">
                        <iframe 
                          className="absolute inset-0 w-full h-full"
                          src={(exercise.video_url || exercise.video_demonstration_url)?.replace('watch?v=', 'embed/')}
                          title={`${exercise.name} demonstration`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Exercise Image</CardTitle>
              </CardHeader>
              <CardContent>
                {exercise.image_url ? (
                  <div className="aspect-square rounded-md overflow-hidden">
                    <img 
                      src={exercise.image_url} 
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
                  {exercise.mechanics && (
                    <>
                      <dt className="font-medium">Mechanics:</dt>
                      <dd className="text-muted-foreground">{exercise.mechanics}</dd>
                    </>
                  )}
                  
                  {exercise.force_type && (
                    <>
                      <dt className="font-medium">Force Type:</dt>
                      <dd className="text-muted-foreground">{exercise.force_type}</dd>
                    </>
                  )}
                  
                  {exercise.posture && (
                    <>
                      <dt className="font-medium">Posture:</dt>
                      <dd className="text-muted-foreground">{exercise.posture}</dd>
                    </>
                  )}
                  
                  {exercise.laterality && (
                    <>
                      <dt className="font-medium">Laterality:</dt>
                      <dd className="text-muted-foreground">{exercise.laterality}</dd>
                    </>
                  )}
                  
                  {exercise.secondary_muscle && (
                    <>
                      <dt className="font-medium">Secondary Muscles:</dt>
                      <dd className="text-muted-foreground">{exercise.secondary_muscle}</dd>
                    </>
                  )}
                  
                  {exercise.tertiary_muscle && (
                    <>
                      <dt className="font-medium">Tertiary Muscles:</dt>
                      <dd className="text-muted-foreground">{exercise.tertiary_muscle}</dd>
                    </>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
