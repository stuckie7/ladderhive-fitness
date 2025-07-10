import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import "./exercise-list.css";

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

interface ExerciseItemProps {
  exercise: Exercise;
  isCompleted: boolean;
  onToggleComplete: (id: string, completed: boolean) => void;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

const ExerciseItem = ({ 
  exercise, 
  isCompleted, 
  onToggleComplete, 
  isExpanded, 
  onToggleExpand 
}: ExerciseItemProps) => {
  return (
    <div 
      className={`exercise-item ${
        isCompleted 
          ? "bg-gray-50 dark:bg-gray-800/50" 
          : ""
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <Checkbox 
            checked={isCompleted}
            onCheckedChange={(checked) => 
              onToggleComplete(exercise.id, checked as boolean)
            }
            className="data-[state=checked]:bg-fitness-primary data-[state=checked]:border-fitness-primary"
          />
          <div>
            <h3 className={`font-medium ${
              isCompleted
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
        
        {isExpanded && (
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
        <ExerciseInfoDialog exercise={exercise} />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full"
          onClick={() => onToggleExpand(exercise.id)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ExerciseItem;

interface ExerciseInfoDialogProps {
  exercise: Exercise;
}

const ExerciseInfoDialog = ({ exercise }: ExerciseInfoDialogProps) => {
  return (
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
  );
};
