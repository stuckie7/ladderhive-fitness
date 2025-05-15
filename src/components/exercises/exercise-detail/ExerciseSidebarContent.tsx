import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Exercise } from "@/types/exercise";
import ExerciseSpecItem from "./ExerciseSpecItem";

interface ExerciseSidebarContentProps {
  exercise: Exercise | null;
  loading?: boolean;
}

export default function ExerciseSidebarContent({ exercise, loading = false }: ExerciseSidebarContentProps) {
  if (loading || !exercise) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="h-5 bg-muted rounded animate-pulse w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="aspect-square rounded-md bg-muted animate-pulse" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="h-5 bg-muted rounded animate-pulse w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded animate-pulse w-full" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse w-4/5" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Exercise Image</CardTitle>
        </CardHeader>
        <CardContent>
          {exercise.gifUrl || exercise.image_url ? (
            <div className="aspect-square rounded-md overflow-hidden">
              <img 
                src={exercise.gifUrl || exercise.image_url || exercise.youtube_thumbnail_url} 
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
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Movement Type</h4>
              {exercise.mechanics && <ExerciseSpecItem label="Mechanics" value={exercise.mechanics} />}
              {exercise.force_type && <ExerciseSpecItem label="Force Type" value={exercise.force_type} />}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Muscles</h4>
              {exercise.posture && <ExerciseSpecItem label="Posture" value={exercise.posture} />}
              {exercise.laterality && <ExerciseSpecItem label="Laterality" value={exercise.laterality} />}
              {exercise.secondaryMuscles?.length > 0 && (
                <ExerciseSpecItem label="Secondary Muscles" value={exercise.secondaryMuscles.join(', ')} />
              )}
              {exercise.tertiary_muscle && (
                <ExerciseSpecItem label="Tertiary Muscles" value={exercise.tertiary_muscle} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
