
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Exercise } from "@/types/exercise";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";

interface ExerciseMainContentProps {
  exercise: Exercise;
}

export default function ExerciseMainContent({ exercise }: ExerciseMainContentProps) {
  return (
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
                <ExerciseVideoPlayer 
                  url={exercise.video_url || exercise.video_demonstration_url || ''} 
                  title={`${exercise.name} demonstration`}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
