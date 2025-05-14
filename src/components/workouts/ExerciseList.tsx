
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ExerciseItem from "./ExerciseItem";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string | number; // Updated to accept both string and number
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
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              isCompleted={completedExercises.includes(exercise.id)}
              onToggleComplete={handleCheckChange}
              isExpanded={expandedExercise === exercise.id}
              onToggleExpand={toggleExpand}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseList;
