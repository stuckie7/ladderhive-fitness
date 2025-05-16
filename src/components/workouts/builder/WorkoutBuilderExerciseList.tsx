
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import ExerciseVideoHandler from "@/components/exercises/ExerciseVideoHandler";
import { Exercise } from "@/types/exercise";

export interface WorkoutExerciseDetail extends Exercise {
  sets: number;
  reps: string;
  weight?: string;
  restTime?: number;
  rest_seconds?: number;
  notes?: string;
  order_index?: number;
}

export interface WorkoutBuilderExerciseListProps {
  exercises: WorkoutExerciseDetail[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<WorkoutExerciseDetail>) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  isLoading: boolean;
}

const WorkoutBuilderExerciseList: React.FC<WorkoutBuilderExerciseListProps> = ({
  exercises,
  onRemove,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onReorder,
  isLoading,
}) => {
  const { toast } = useToast();
  
  const handleDetailChange = (
    exerciseId: string,
    field: string,
    value: string | number
  ) => {
    onUpdate(exerciseId, { [field]: value });
  };

  return (
    <Accordion type="multiple" className="space-y-2">
      {exercises.map((exercise, index) => (
        <AccordionItem key={exercise.id} value={exercise.id.toString()} className="border rounded-md">
          <AccordionTrigger className="px-4">
            <div className="flex justify-between w-full">
              <span>{exercise.name}</span>
              {isLoading && <span className="text-muted-foreground text-sm">Loading...</span>}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Exercise Details</CardTitle>
                <CardDescription>
                  Adjust the sets, reps, weight, and rest time for this exercise.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`sets-${exercise.id}`}>Sets</Label>
                    <Input
                      type="number"
                      id={`sets-${exercise.id}`}
                      value={exercise.sets}
                      onChange={(e) =>
                        handleDetailChange(
                          exercise.id.toString(),
                          "sets",
                          parseInt(e.target.value || '3')
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`reps-${exercise.id}`}>Reps</Label>
                    <Input
                      type="text"
                      id={`reps-${exercise.id}`}
                      value={exercise.reps}
                      onChange={(e) =>
                        handleDetailChange(
                          exercise.id.toString(),
                          "reps",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`weight-${exercise.id}`}>Weight</Label>
                  <Input
                    type="text"
                    id={`weight-${exercise.id}`}
                    value={exercise.weight || ''}
                    placeholder="Enter weight"
                    onChange={(e) =>
                      handleDetailChange(
                        exercise.id.toString(),
                        "weight",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`rest-${exercise.id}`}>
                    Rest Time (seconds): {exercise.rest_seconds || exercise.restTime || 60}
                  </Label>
                  <Slider
                    id={`rest-${exercise.id}`}
                    value={[exercise.rest_seconds || exercise.restTime || 60]}
                    max={300}
                    step={10}
                    onValueChange={(value) =>
                      handleDetailChange(
                        exercise.id.toString(),
                        "rest_seconds",
                        value[0]
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`notes-${exercise.id}`}>Notes</Label>
                  <Input
                    type="text"
                    id={`notes-${exercise.id}`}
                    value={exercise.notes || ''}
                    placeholder="Add notes (optional)"
                    onChange={(e) =>
                      handleDetailChange(
                        exercise.id.toString(),
                        "notes",
                        e.target.value
                      )
                    }
                  />
                </div>
                {(exercise.video_url || exercise.short_youtube_demo) && (
                  <ExerciseVideoHandler 
                    url={exercise.video_url || exercise.short_youtube_demo || ''} 
                    title={exercise.name} 
                  />
                )}
              </CardContent>
              <CardFooter className="justify-between">
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMoveUp(exercise.id.toString())}
                    disabled={index === 0}
                  >
                    Up
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMoveDown(exercise.id.toString())}
                    disabled={index === exercises.length - 1}
                  >
                    Down
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemove(exercise.id.toString())}
                >
                  Remove
                </Button>
              </CardFooter>
            </Card>
          </AccordionContent>
        </AccordionItem>
      ))}
      {exercises.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            No exercises added to this workout yet.
          </CardContent>
        </Card>
      )}
    </Accordion>
  );
};

export default WorkoutBuilderExerciseList;
