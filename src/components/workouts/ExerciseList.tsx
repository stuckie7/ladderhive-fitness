
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ExerciseItem from "./ExerciseItem";

// Define a specific interface for the exercises used in this component
interface ExerciseListItem {
  id: string;
  name: string;
  sets: number;
  reps: string | number; // Use string | number to handle various rep formats
  weight?: string;
  restTime?: number;
  description?: string;
  demonstration?: string;
}

interface ExerciseListProps {
  exercises: ExerciseListItem[];
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
              exercise={exercise as any} // Type assertion to avoid conflicts with Exercise type
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
