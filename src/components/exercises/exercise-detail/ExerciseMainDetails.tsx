
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseFull } from "@/types/exercise";
import ExerciseSpecItem from "./ExerciseSpecItem";
import ExerciseVideoHandler from "@/components/exercises/ExerciseVideoHandler";
import { Play, Info } from "lucide-react";

interface ExerciseMainDetailsProps {
  exercise: ExerciseFull;
}

export default function ExerciseMainDetails({ exercise }: ExerciseMainDetailsProps) {
  // Check if any video content is available
  const hasVideo = Boolean(exercise.short_youtube_demo || exercise.in_depth_youtube_exp);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Details</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display main video prominently if available */}
        {hasVideo && (
          <div className="mb-6">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <iframe 
                className="w-full h-full"
                src={getEmbeddedYoutubeUrl(exercise.short_youtube_demo || exercise.in_depth_youtube_exp || '')} 
                title={`${exercise.name} demonstration`}
                allowFullScreen
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center">
              <Play className="h-4 w-4 mr-1" /> Video demonstration of {exercise.name}
            </p>
          </div>
        )}

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {exercise.description && <TabsTrigger value="instructions">Instructions</TabsTrigger>}
            <TabsTrigger value="patterns">Movement Patterns</TabsTrigger>
            {(exercise.short_youtube_demo && exercise.in_depth_youtube_exp) && (
              <TabsTrigger value="videos">Additional Videos</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Primary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <ExerciseSpecItem label="Primary Muscle" value={exercise.prime_mover_muscle} />
                  <ExerciseSpecItem label="Secondary Muscle" value={exercise.secondary_muscle} />
                  <ExerciseSpecItem label="Equipment" value={exercise.primary_equipment} />
                  <ExerciseSpecItem label="Secondary Equipment" value={exercise.secondary_equipment} />
                  <ExerciseSpecItem label="Body Region" value={exercise.body_region} />
                  <ExerciseSpecItem label="Difficulty" value={exercise.difficulty} />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Mechanics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <ExerciseSpecItem label="Force Type" value={exercise.force_type} />
                  <ExerciseSpecItem label="Mechanics" value={exercise.mechanics} />
                  <ExerciseSpecItem label="Posture" value={exercise.posture} />
                  <ExerciseSpecItem label="Laterality" value={exercise.laterality} />
                  <ExerciseSpecItem label="Classification" value={exercise.exercise_classification} />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {exercise.description && (
            <TabsContent value="instructions">
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Info className="h-5 w-5 mr-2" /> Instructions
                </h3>
                <div className="text-muted-foreground space-y-2 whitespace-pre-wrap">
                  {typeof exercise.description === 'string' ? (
                    <p>{exercise.description}</p>
                  ) : exercise.instructions?.length ? (
                    <ol className="list-decimal pl-5">
                      {exercise.instructions.map((instruction, i) => (
                        <li key={i} className="mb-2">{instruction}</li>
                      ))}
                    </ol>
                  ) : (
                    <p>No detailed instructions available for this exercise.</p>
                  )}
                </div>
              </div>
            </TabsContent>
          )}
          
          <TabsContent value="patterns">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Movement Patterns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <ExerciseSpecItem label="Pattern 1" value={exercise.movement_pattern_1} />
                  <ExerciseSpecItem label="Pattern 2" value={exercise.movement_pattern_2} />
                  <ExerciseSpecItem label="Pattern 3" value={exercise.movement_pattern_3} />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Planes of Motion</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <ExerciseSpecItem label="Plane 1" value={exercise.plane_of_motion_1} />
                  <ExerciseSpecItem label="Plane 2" value={exercise.plane_of_motion_2} />
                  <ExerciseSpecItem label="Plane 3" value={exercise.plane_of_motion_3} />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Additional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <ExerciseSpecItem label="Arm Movement" value={exercise.arm_movement_pattern} />
                  <ExerciseSpecItem label="Leg Movement" value={exercise.leg_movement_pattern} />
                  <ExerciseSpecItem label="Single/Double Arm" value={exercise.single_or_double_arm} />
                  <ExerciseSpecItem label="Grip" value={exercise.grip} />
                  <ExerciseSpecItem label="Load Position" value={exercise.load_position} />
                  <ExerciseSpecItem label="Foot Elevation" value={exercise.foot_elevation} />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {(exercise.short_youtube_demo && exercise.in_depth_youtube_exp) && (
            <TabsContent value="videos">
              <div className="space-y-8">
                {exercise.in_depth_youtube_exp && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">In-Depth Explanation</h3>
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      <iframe 
                        className="w-full h-full"
                        src={getEmbeddedYoutubeUrl(exercise.in_depth_youtube_exp)} 
                        title="In-Depth Explanation"
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
  );
}

// Helper function to convert YouTube URL to embedded format
function getEmbeddedYoutubeUrl(url: string): string {
  if (!url) return '';
  
  // Remove quotes if they exist in the URL
  let cleanUrl = url.replace(/^["']|["']$/g, '');
  
  // Handle youtube.com/watch?v= format
  if (cleanUrl.includes('watch?v=')) {
    return cleanUrl.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/, 'https://www.youtube.com/embed/$1');
  }
  
  // Handle youtu.be/ format
  if (cleanUrl.includes('youtu.be/')) {
    return cleanUrl.replace(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/(.+)/, 'https://www.youtube.com/embed/$1');
  }
  
  // If it's already in the embed format or can't be parsed, return as is
  return cleanUrl;
}
