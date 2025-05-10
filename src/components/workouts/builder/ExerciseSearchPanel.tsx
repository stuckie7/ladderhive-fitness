
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus, Dumbbell } from "lucide-react";
import { ExerciseFull } from "@/types/exercise";
import { Skeleton } from "@/components/ui/skeleton";

interface ExerciseSearchPanelProps {
  searchQuery: string;
  selectedMuscleGroup: string;
  selectedEquipment: string;
  selectedDifficulty: string;
  searchResults: ExerciseFull[];
  isLoading: boolean;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: string, value: string) => void;
  onAddExercise: (exercise: ExerciseFull) => void;
}

const ExerciseSearchPanel: React.FC<ExerciseSearchPanelProps> = ({
  searchQuery,
  selectedMuscleGroup,
  selectedEquipment,
  selectedDifficulty,
  searchResults,
  isLoading,
  onSearchChange,
  onFilterChange,
  onAddExercise
}) => {
  const muscleGroups = [
    { value: "all_muscle_groups", label: "All Muscle Groups" },
    { value: "chest", label: "Chest" },
    { value: "back", label: "Back" },
    { value: "shoulders", label: "Shoulders" },
    { value: "legs", label: "Legs" },
    { value: "arms", label: "Arms" },
    { value: "core", label: "Core" },
    { value: "glutes", label: "Glutes" }
  ];
  
  const equipmentTypes = [
    { value: "all_equipment", label: "All Equipment" },
    { value: "barbell", label: "Barbell" },
    { value: "dumbbell", label: "Dumbbell" },
    { value: "kettlebell", label: "Kettlebell" },
    { value: "bodyweight", label: "Bodyweight" },
    { value: "machine", label: "Machine" },
    { value: "cable", label: "Cable" },
    { value: "resistance band", label: "Resistance Band" },
    { value: "other", label: "Other" }
  ];
  
  const difficultyLevels = [
    { value: "all_difficulties", label: "All Difficulties" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
  ];

  return (
    <Card className="h-full glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="mr-2 h-5 w-5 text-fitness-primary" />
          Exercise Library
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search input */}
          <div>
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-gray-950"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-2">
            <Select
              value={selectedMuscleGroup}
              onValueChange={(value) => onFilterChange("muscleGroup", value)}
            >
              <SelectTrigger className="bg-gray-950">
                <SelectValue placeholder="Filter by muscle group" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map(group => (
                  <SelectItem key={group.value} value={group.value}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={selectedEquipment}
              onValueChange={(value) => onFilterChange("equipment", value)}
            >
              <SelectTrigger className="bg-gray-950">
                <SelectValue placeholder="Filter by equipment" />
              </SelectTrigger>
              <SelectContent>
                {equipmentTypes.map(eq => (
                  <SelectItem key={eq.value} value={eq.value}>
                    {eq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={selectedDifficulty}
              onValueChange={(value) => onFilterChange("difficulty", value)}
            >
              <SelectTrigger className="bg-gray-950">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficultyLevels.map(diff => (
                  <SelectItem key={diff.value} value={diff.value}>
                    {diff.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search results */}
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {isLoading ? "Searching..." : 
               searchResults.length > 0 ? `Found ${searchResults.length} exercises` : 
               searchQuery.length >= 2 ? "No exercises found" : 
               "Type at least 2 characters to search"}
            </h3>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {isLoading ? (
                // Loading skeletons
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2 p-2 border border-gray-800 rounded-md">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                ))
              ) : searchResults.length > 0 ? (
                // Search results
                searchResults.map((exercise) => (
                  <div 
                    key={exercise.id}
                    className="flex items-center justify-between p-3 border border-gray-800 rounded-md hover:border-fitness-primary/50 hover:bg-gray-900/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-fitness-primary/20 text-fitness-primary">
                        <Dumbbell className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{exercise.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {exercise.prime_mover_muscle || exercise.target_muscle_group} • {exercise.primary_equipment || "Bodyweight"}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onAddExercise(exercise)}
                      title="Add to workout"
                      className="h-7 w-7 text-fitness-primary hover:text-fitness-primary hover:bg-fitness-primary/20"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : searchQuery.length >= 2 ? (
                <div className="text-center p-4">
                  <p>No exercises found matching your search criteria.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseSearchPanel;
