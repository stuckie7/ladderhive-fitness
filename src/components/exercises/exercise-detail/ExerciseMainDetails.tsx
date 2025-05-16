
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseFull } from "@/types/exercise";
import ExerciseSpecItem from "./ExerciseSpecItem";
import ExerciseVideoHandler from "@/components/exercises/ExerciseVideoHandler";

interface ExerciseMainDetailsProps {
  exercise: ExerciseFull;
}

export default function ExerciseMainDetails({ exercise }: ExerciseMainDetailsProps) {
  return (
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
          
          {(exercise.short_youtube_demo || exercise.in_depth_youtube_exp) && (
            <TabsContent value="videos">
              <div className="space-y-8">
                {exercise.short_youtube_demo && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Quick Demonstration</h3>
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      {exercise.short_youtube_demo.includes("youtube.com") || 
                       exercise.short_youtube_demo.includes("youtu.be") ? (
                        <iframe 
                          className="w-full h-full"
                          src={getEmbeddedYoutubeUrl(exercise.short_youtube_demo)} 
                          title="Quick Demonstration"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ExerciseVideoHandler 
                            url={exercise.short_youtube_demo} 
                            title="Quick Demonstration"
                            className="text-center p-4" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {exercise.in_depth_youtube_exp && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">In-Depth Explanation</h3>
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      {exercise.in_depth_youtube_exp.includes("youtube.com") || 
                       exercise.in_depth_youtube_exp.includes("youtu.be") ? (
                        <iframe 
                          className="w-full h-full"
                          src={getEmbeddedYoutubeUrl(exercise.in_depth_youtube_exp)} 
                          title="In-Depth Explanation"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ExerciseVideoHandler 
                            url={exercise.in_depth_youtube_exp} 
                            title="In-Depth Explanation"
                            className="text-center p-4" 
                          />
                        </div>
                      )}
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
