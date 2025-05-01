import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExerciseFull } from '@/types/exercise';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getExerciseFullById } from '@/hooks/exercise-library/services/exercise-detail-service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Dumbbell, PlayCircle, Edit, Plus } from 'lucide-react';

export default function ExerciseDetailEnhanced() {
  const [exercise, setExercise] = useState<ExerciseFull | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // Convert id to number for ExerciseFull type
        const exerciseId = parseInt(id, 10);
        if (isNaN(exerciseId)) {
          throw new Error('Invalid exercise ID');
        }
        
        const exerciseData = await getExerciseFullById(exerciseId);
        setExercise(exerciseData);
      } catch (error) {
        console.error('Error fetching exercise:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [id]);
  
  // Helper function to determine difficulty badge class
  const getDifficultyBadgeClass = (difficulty: string | null) => {
    if (!difficulty) return "bg-gray-100 text-gray-800";
    
    switch(difficulty.toLowerCase()) {
      case 'beginner':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'intermediate':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 'advanced':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleBackClick = () => {
    navigate('/exercise-library-enhanced');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <Button variant="outline" className="mb-6" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exercises
          </Button>
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-8 w-1/3 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 mb-4" />
              <Skeleton className="h-32" />
            </div>
            <div>
              <Skeleton className="h-64 mb-4" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!exercise) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <Button variant="outline" className="mb-6" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exercises
          </Button>
          <div className="text-center py-12">
            <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Exercise Not Found</h1>
            <p className="text-muted-foreground mb-6">The exercise you are looking for doesn't exist or has been removed.</p>
            <Button onClick={handleBackClick}>
              Return to Exercise Library
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button variant="outline" className="mb-6" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Exercises
        </Button>
        
        {/* Exercise Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{exercise.name}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {exercise.prime_mover_muscle && (
                <Badge variant="outline">{exercise.prime_mover_muscle}</Badge>
              )}
              {exercise.body_region && exercise.body_region !== exercise.prime_mover_muscle && (
                <Badge variant="outline">{exercise.body_region}</Badge>
              )}
              {exercise.primary_equipment && (
                <Badge variant="secondary">{exercise.primary_equipment}</Badge>
              )}
              {exercise.difficulty && (
                <Badge className={getDifficultyBadgeClass(exercise.difficulty)}>
                  {exercise.difficulty}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add to Workout
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Exercise Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="patterns">Movement Patterns</TabsTrigger>
                    {(exercise.short_youtube_demo || exercise.in_depth_youtube_exp) && (
                      <TabsTrigger value="videos">Videos</TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="overview">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Primary Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          <SpecItem label="Primary Muscle" value={exercise.prime_mover_muscle} />
                          <SpecItem label="Secondary Muscle" value={exercise.secondary_muscle} />
                          <SpecItem label="Equipment" value={exercise.primary_equipment} />
                          <SpecItem label="Secondary Equipment" value={exercise.secondary_equipment} />
                          <SpecItem label="Body Region" value={exercise.body_region} />
                          <SpecItem label="Difficulty" value={exercise.difficulty} />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Mechanics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          <SpecItem label="Force Type" value={exercise.force_type} />
                          <SpecItem label="Mechanics" value={exercise.mechanics} />
                          <SpecItem label="Posture" value={exercise.posture} />
                          <SpecItem label="Laterality" value={exercise.laterality} />
                          <SpecItem label="Classification" value={exercise.exercise_classification} />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="patterns">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Movement Patterns</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          <SpecItem label="Pattern 1" value={exercise.movement_pattern_1} />
                          <SpecItem label="Pattern 2" value={exercise.movement_pattern_2} />
                          <SpecItem label="Pattern 3" value={exercise.movement_pattern_3} />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Planes of Motion</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          <SpecItem label="Plane 1" value={exercise.plane_of_motion_1} />
                          <SpecItem label="Plane 2" value={exercise.plane_of_motion_2} />
                          <SpecItem label="Plane 3" value={exercise.plane_of_motion_3} />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Additional Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          <SpecItem label="Arm Movement" value={exercise.arm_movement_pattern} />
                          <SpecItem label="Leg Movement" value={exercise.leg_movement_pattern} />
                          <SpecItem label="Single/Double Arm" value={exercise.single_or_double_arm} />
                          <SpecItem label="Grip" value={exercise.grip} />
                          <SpecItem label="Load Position" value={exercise.load_position} />
                          <SpecItem label="Foot Elevation" value={exercise.foot_elevation} />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {(exercise.short_youtube_demo || exercise.in_depth_youtube_exp) && (
                    <TabsContent value="videos">
                      <div className="space-y-8">
                        {exercise.short_youtube_demo && (
                          <div>
                            <h3 className="text-lg font-medium mb-3 flex items-center">
                              <PlayCircle className="h-5 w-5 mr-2 text-red-600" />
                              Quick Demonstration
                            </h3>
                            <div className="aspect-video rounded-md overflow-hidden">
                              <iframe 
                                className="w-full h-full"
                                src={getEmbeddedYoutubeUrl(exercise.short_youtube_demo)}
                                title={`${exercise.name} demonstration`}
                                allowFullScreen
                              />
                            </div>
                          </div>
                        )}
                        
                        {exercise.in_depth_youtube_exp && (
                          <div>
                            <h3 className="text-lg font-medium mb-3 flex items-center">
                              <PlayCircle className="h-5 w-5 mr-2 text-red-600" />
                              In-Depth Explanation
                            </h3>
                            <div className="aspect-video rounded-md overflow-hidden">
                              <iframe 
                                className="w-full h-full"
                                src={getEmbeddedYoutubeUrl(exercise.in_depth_youtube_exp)}
                                title={`${exercise.name} explanation`}
                                allowFullScreen
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Sidebar Information */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Key Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                    <div>
                      <p className="font-semibold">Primary Muscle</p>
                      <p className="text-muted-foreground">{exercise.prime_mover_muscle || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                    <div>
                      <p className="font-semibold">Equipment</p>
                      <p className="text-muted-foreground">{exercise.primary_equipment || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-3"></div>
                    <div>
                      <p className="font-semibold">Difficulty</p>
                      <p className="text-muted-foreground">{exercise.difficulty || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-3"></div>
                    <div>
                      <p className="font-semibold">Mechanics</p>
                      <p className="text-muted-foreground">{exercise.mechanics || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                    <div>
                      <p className="font-semibold">Force Type</p>
                      <p className="text-muted-foreground">{exercise.force_type || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Related Exercises</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">
                  Related exercises will be shown here based on the same muscle group and equipment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Helper component for displaying specifications
const SpecItem = ({ label, value }: { label: string; value: string | null | undefined }) => {
  if (!value) return null;
  
  return (
    <div className="mb-2">
      <p className="font-medium">{label}:</p>
      <p className="text-muted-foreground">{value}</p>
    </div>
  );
};

// Helper function to convert YouTube URLs to embedded format
const getEmbeddedYoutubeUrl = (url: string): string => {
  if (!url) return '';
  
  // Handle youtube.com/watch?v= format
  if (url.includes('watch?v=')) {
    return url.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/, 'https://www.youtube.com/embed/$1');
  }
  
  // Handle youtu.be/ format
  if (url.includes('youtu.be/')) {
    return url.replace(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/(.+)/, 'https://www.youtube.com/embed/$1');
  }
  
  // If it's already in the embed format or can't be parsed, return as is
  return url;
};
