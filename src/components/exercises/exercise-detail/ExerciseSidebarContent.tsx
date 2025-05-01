
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Exercise } from "@/types/exercise";
import ExerciseSpecItem from "./ExerciseSpecItem";

interface ExerciseSidebarContentProps {
  exercise: Exercise;
}

export default function ExerciseSidebarContent({ exercise }: ExerciseSidebarContentProps) {
  return (
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
          <div className="space-y-2">
            {exercise.mechanics && <ExerciseSpecItem label="Mechanics" value={exercise.mechanics} />}
            {exercise.force_type && <ExerciseSpecItem label="Force Type" value={exercise.force_type} />}
            {exercise.posture && <ExerciseSpecItem label="Posture" value={exercise.posture} />}
            {exercise.laterality && <ExerciseSpecItem label="Laterality" value={exercise.laterality} />}
            {exercise.secondaryMuscles?.length > 0 && (
              <ExerciseSpecItem label="Secondary Muscles" value={exercise.secondaryMuscles.join(', ')} />
            )}
            {exercise.tertiary_muscle && <ExerciseSpecItem label="Tertiary Muscles" value={exercise.tertiary_muscle} />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
