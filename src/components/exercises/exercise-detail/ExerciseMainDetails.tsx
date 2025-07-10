
import { ExerciseFull } from "@/types/exercise";
import ExerciseSpecItem from "./ExerciseSpecItem";
import { Dumbbell, Target, Activity, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExerciseMainDetailsProps {
  exercise: ExerciseFull;
}

export default function ExerciseMainDetails({ exercise }: ExerciseMainDetailsProps) {
  // Parse instructions if they exist as a string
  const getInstructions = (): string[] => {
    if (!exercise.instructions) return [];
    
    if (typeof exercise.instructions === 'string') {
      // Try to parse JSON string
      try {
        const parsed = JSON.parse(exercise.instructions);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return exercise.instructions.split('\n').filter(line => line.trim() !== '');
      } catch (e) {
        // If not valid JSON, split by newlines
        return exercise.instructions.split('\n').filter(line => line.trim() !== '');
      }
    }
    
    // If already an array
    if (Array.isArray(exercise.instructions)) {
      return exercise.instructions;
    }
    
    return [];
  };
  
  const instructions = getInstructions();
  
  return (
    <div className="space-y-6">
      {/* Exercise Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            Exercise Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ExerciseSpecItem
            label="Equipment"
            value={exercise.primary_equipment || 'Bodyweight'}
          />
          <ExerciseSpecItem
            label="Difficulty"
            value={exercise.difficulty || 'Beginner'}
          />
          <ExerciseSpecItem
            label="Primary Muscle"
            value={exercise.prime_mover_muscle || 'N/A'}
          />
          <ExerciseSpecItem
            label="Secondary Muscles"
            value={exercise.secondary_muscle || 'N/A'}
          />
          <ExerciseSpecItem
            label="Body Region"
            value={exercise.body_region || 'N/A'}
          />
          <ExerciseSpecItem
            label="Movement Type"
            value={exercise.mechanics || 'N/A'}
          />
        </CardContent>
      </Card>

      {/* Exercise Description */}
      {exercise.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">{exercise.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Exercise Instructions */}
      {instructions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              {instructions.map((instruction, index) => (
                <li key={index} className="pl-1">{instruction}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
