
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: string;
  restTime?: number;
  description?: string;
  demonstration?: string;
}

interface ExerciseListProps {
  exercises: Exercise[];
  onComplete?: (exerciseId: string, completed: boolean) => void;
}

const ExerciseList = ({ exercises, onComplete }: ExerciseListProps) => {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedExercise(expandedExercise === id ? null : id);
  };

  const handleCheckChange = (id: string, checked: boolean) => {
    const newCompleted = checked 
      ? [...completedExercises, id] 
      : completedExercises.filter(e => e !== id);
    
    setCompletedExercises(newCompleted);
    if (onComplete) {
      onComplete(id, checked);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Exercise List</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {exercises.map((exercise) => (
            <div 
              key={exercise.id} 
              className={`exercise-item ${
                completedExercises.includes(exercise.id) 
                  ? "bg-gray-50 dark:bg-gray-800/50" 
                  : ""
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={completedExercises.includes(exercise.id)}
                    onCheckedChange={(checked) => 
                      handleCheckChange(exercise.id, checked as boolean)
                    }
                    className="data-[state=checked]:bg-fitness-primary data-[state=checked]:border-fitness-primary"
                  />
                  <div>
                    <h3 className={`font-medium ${
                      completedExercises.includes(exercise.id) 
                        ? "line-through text-muted-foreground" 
                        : ""
                    }`}>
                      {exercise.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {exercise.sets} sets × {exercise.reps} reps
                      {exercise.weight && ` · ${exercise.weight}`}
                    </p>
                  </div>
                </div>
                
                {expandedExercise === exercise.id && (
                  <div className="mt-3 pl-9 animate-fade-in">
                    {exercise.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {exercise.description}
                      </p>
                    )}
                    {exercise.restTime && (
                      <p className="text-sm text-muted-foreground">
                        Rest: {exercise.restTime} sec between sets
                      </p>
                    )}
                    {exercise.demonstration && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 text-fitness-primary border-fitness-primary hover:bg-fitness-primary/10"
                      >
                        View Demonstration
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-muted-foreground"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{exercise.name}</DialogTitle>
                      <DialogDescription>
                        How to perform this exercise correctly
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {exercise.demonstration && (
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <p className="text-muted-foreground">Demonstration video would go here</p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium mb-1">Instructions</h4>
                        <p className="text-sm text-muted-foreground">
                          {exercise.description || "No detailed instructions available for this exercise."}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Sets</p>
                            <p className="font-medium">{exercise.sets}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Reps</p>
                            <p className="font-medium">{exercise.reps}</p>
                          </div>
                          {exercise.weight && (
                            <div>
                              <p className="text-muted-foreground">Weight</p>
                              <p className="font-medium">{exercise.weight}</p>
                            </div>
                          )}
                          {exercise.restTime && (
                            <div>
                              <p className="text-muted-foreground">Rest Time</p>
                              <p className="font-medium">{exercise.restTime} sec</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => toggleExpand(exercise.id)}
                >
                  {expandedExercise === exercise.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseList;
