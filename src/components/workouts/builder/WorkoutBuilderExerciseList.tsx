
import React, { useState } from "react";
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

interface WorkoutBuilderExerciseListProps {
  exercises: Exercise[];
  onExerciseDetailsChange: (
    exerciseId: string,
    sets: number,
    reps: string,
    weight: string,
    restTime: number
  ) => void;
  onRemoveExercise: (exerciseId: string) => void;
}

const WorkoutBuilderExerciseList: React.FC<WorkoutBuilderExerciseListProps> = ({
  exercises,
  onExerciseDetailsChange,
  onRemoveExercise,
}) => {
  const { toast } = useToast();
  const [exerciseDetails, setExerciseDetails] = useState<{
    [exerciseId: string]: {
      sets: number;
      reps: string;
      weight: string;
      restTime: number;
    };
  }>({});

  const handleDetailsChange = (
    exerciseId: string,
    field: string,
    value: string | number
  ) => {
    setExerciseDetails((prevDetails) => ({
      ...prevDetails,
      [exerciseId]: {
        ...prevDetails[exerciseId],
        [field]: value,
      },
    }));
  };

  const handleSaveDetails = (exerciseId: string) => {
    const details = exerciseDetails[exerciseId];
    if (details) {
      onExerciseDetailsChange(
        exerciseId,
        details.sets,
        details.reps,
        details.weight,
        details.restTime
      );
      toast({
        title: "Details Saved",
        description: "Exercise details have been saved.",
      });
    }
  };

  return (
    <Accordion type="multiple">
      {exercises.map((exercise) => (
        <AccordionItem key={exercise.id} value={exercise.id.toString()}>
          <AccordionTrigger>
            {exercise.name}
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
                      defaultValue="3"
                      onChange={(e) =>
                        handleDetailsChange(
                          exercise.id.toString(),
                          "sets",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`reps-${exercise.id}`}>Reps</Label>
                    <Input
                      type="text"
                      id={`reps-${exercise.id}`}
                      defaultValue="10"
                      onChange={(e) =>
                        handleDetailsChange(
                          exercise.id.toString(),
                          "reps",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`weight-${exercise.id}`}>Weight (lbs)</Label>
                  <Input
                    type="text"
                    id={`weight-${exercise.id}`}
                    placeholder="Enter weight"
                    onChange={(e) =>
                      handleDetailsChange(
                        exercise.id.toString(),
                        "weight",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`rest-${exercise.id}`}>Rest Time (seconds)</Label>
                  <Slider
                    defaultValue={[60]}
                    max={300}
                    step={30}
                    onValueChange={(value) =>
                      handleDetailsChange(
                        exercise.id.toString(),
                        "restTime",
                        value[0]
                      )
                    }
                  />
                </div>
                {exercise.video_url && (
                  <ExerciseVideoHandler 
                    url={exercise.video_url} 
                    title={exercise.name || "Exercise Video"} 
                    className="w-full h-32" 
                  />
                )}
              </CardContent>
              <CardFooter className="justify-between">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemoveExercise(exercise.id.toString())}
                >
                  Remove
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSaveDetails(exercise.id.toString())}
                >
                  Save Details
                </Button>
              </CardFooter>
            </Card>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default WorkoutBuilderExerciseList;
