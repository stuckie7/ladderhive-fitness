import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Exercise } from "@/types/exercise";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";

interface ExerciseMainContentProps {
  exercise: Exercise | null;
  loading?: boolean;
}

export default function ExerciseMainContent({ exercise, loading = false }: ExerciseMainContentProps) {
  if (loading || !exercise) {
    return (
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="h-5 bg-muted rounded animate-pulse w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded animate-pulse w-full" />
              <div className="h-4 bg-muted rounded animate-pulse w-full" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasVideo = Boolean(exercise.video_url || exercise.video_demonstration_url);

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
              {hasVideo && <TabsTrigger value="video">Video</TabsTrigger>}
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

            {hasVideo && (
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
