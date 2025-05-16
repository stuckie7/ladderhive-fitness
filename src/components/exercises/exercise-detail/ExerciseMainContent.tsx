
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Exercise, ExerciseFull } from "@/types/exercise";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";
import ExerciseVideoHandler from "@/components/exercises/ExerciseVideoHandler";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Flame, Target, Video } from "lucide-react";
import ExerciseMainDetails from "./ExerciseMainDetails";

interface ExerciseMainContentProps {
  exercise: ExerciseFull | null;
  loading?: boolean;
}

export default function ExerciseMainContent({ exercise, loading = false }: ExerciseMainContentProps) {
  if (loading || !exercise) {
    return (
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
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" /> 
          Exercise Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ExerciseMainDetails exercise={exercise} />
      </CardContent>
    </Card>
  );
            <div className="flex flex-wrap gap-2">
              {exercise.mechanics && (
                <Badge variant="outline" className="bg-accent/50">
                  {exercise.mechanics}
                </Badge>
              )}
              {exercise.force_type && (
                <Badge variant="outline" className="bg-accent/50">
                  {exercise.force_type}
                </Badge>
              )}
              {exercise.posture && (
                <Badge variant="outline" className="bg-accent/50">
                  {exercise.posture}
                </Badge>
              )}
              {exercise.laterality && (
                <Badge variant="outline" className="bg-accent/50">
                  {exercise.laterality}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
