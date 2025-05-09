import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Exercise } from "@/types/exercise";
import { useExerciseLibrary } from "@/hooks/use-exercise-library";

interface ExerciseSearchProps {
  onSelectExercise?: (exercise: Exercise) => void;
  className?: string;
}

export const ExerciseSearch = ({ onSelectExercise, className = "" }: ExerciseSearchProps) => {
  const [localQuery, setLocalQuery] = useState("");
  const [results, setResults] = useState<Exercise[]>([]);
  const { handleSearch } = useExerciseLibrary();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (localQuery.trim()) {
        const searchResults = await handleSearch(localQuery);
        setResults(searchResults);
      } else {
        setResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [localQuery, handleSearch]);

  const handleSelectExercise = (exercise: Exercise) => {
    if (onSelectExercise) {
      onSelectExercise(exercise);
      setLocalQuery(""); // Clear search after selection
      setResults([]); // Clear results
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search all exercises..."
          className="w-full pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      </div>
      
      {results.length > 0 && (
        <div className="absolute z-10 mt-2 w-full bg-background border rounded-lg shadow-lg max-h-96 overflow-auto">
          {results.map((exercise) => (
            <div 
              key={exercise.id} 
              className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
              onClick={() => handleSelectExercise(exercise)}
            >
              <h4 className="font-medium">{exercise.name}</h4>
              <div className="flex gap-2 text-sm text-muted-foreground">
                {exercise.target_muscle_group && (
                  <span>{exercise.target_muscle_group}</span>
                )}
                {exercise.primary_equipment && (
                  <span>• {exercise.primary_equipment}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
