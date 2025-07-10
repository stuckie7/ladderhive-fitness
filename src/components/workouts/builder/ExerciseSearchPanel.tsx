
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Filter, Dumbbell } from "lucide-react";
import { ExerciseFull } from "@/types/exercise";
import { supabase } from "@/lib/supabase";

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
  onAddExercise,
}) => {
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [difficultyLevels, setDifficultyLevels] = useState<string[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  
  // Fetch filter options from the database
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch unique muscle groups
        const { data: muscleData, error: muscleError } = await supabase
          .from("exercises_full")
          .select("prime_mover_muscle")
          .not("prime_mover_muscle", "is", null);
        
        if (muscleError) throw muscleError;
        
        // Get unique values
        const uniqueMuscleGroups = Array.from(
          new Set(muscleData.map(item => item.prime_mover_muscle))
        ).filter(Boolean).sort();
        
        setMuscleGroups(uniqueMuscleGroups as string[]);
        
        // Fetch unique equipment types
        const { data: equipmentData, error: equipmentError } = await supabase
          .from("exercises_full")
          .select("primary_equipment")
          .not("primary_equipment", "is", null);
          
        if (equipmentError) throw equipmentError;
        
        // Get unique values
        const uniqueEquipment = Array.from(
          new Set(equipmentData.map(item => item.primary_equipment))
        ).filter(Boolean).sort();
        
        setEquipmentTypes(uniqueEquipment as string[]);
        
        // Fetch unique difficulty levels
        const { data: difficultyData, error: difficultyError } = await supabase
          .from("exercises_full")
          .select("difficulty")
          .not("difficulty", "is", null);
          
        if (difficultyError) throw difficultyError;
        
        // Get unique values
        const uniqueDifficulties = Array.from(
          new Set(difficultyData.map(item => item.difficulty))
        ).filter(Boolean).sort();
        
        setDifficultyLevels(uniqueDifficulties as string[]);
        
      } catch (error) {
        console.error("Error fetching filter options:", error);
      } finally {
        setIsLoadingFilters(false);
      }
    };
    
    fetchFilterOptions();
  }, []);

  return (
    <Card className="glass-panel h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="mr-2 h-5 w-5 text-fitness-primary" />
          Find Exercises
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search exercises..."
            className="pl-10 bg-gray-950"
          />
        </div>
        
        {/* Filter section */}
        <div className="space-y-3 pt-3 border-t border-gray-800">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <h4 className="text-sm font-medium">Filters</h4>
          </div>
          
          {isLoadingFilters ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <>
              {/* Muscle group filter */}
              <div>
                <label htmlFor="muscle-group" className="text-xs text-muted-foreground block mb-1">
                  Muscle Group
                </label>
                <Select
                  value={selectedMuscleGroup}
                  onValueChange={(value) => onFilterChange("muscleGroup", value)}
                >
                  <SelectTrigger id="muscle-group" className="bg-gray-950">
                    <SelectValue placeholder="All muscle groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_muscle_groups">All muscle groups</SelectItem>
                    {muscleGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Equipment filter */}
              <div>
                <label htmlFor="equipment" className="text-xs text-muted-foreground block mb-1">
                  Equipment
                </label>
                <Select
                  value={selectedEquipment}
                  onValueChange={(value) => onFilterChange("equipment", value)}
                >
                  <SelectTrigger id="equipment" className="bg-gray-950">
                    <SelectValue placeholder="All equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_equipment">All equipment</SelectItem>
                    {equipmentTypes.map((equipment) => (
                      <SelectItem key={equipment} value={equipment}>
                        {equipment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Difficulty filter */}
              <div>
                <label htmlFor="difficulty" className="text-xs text-muted-foreground block mb-1">
                  Difficulty
                </label>
                <Select
                  value={selectedDifficulty}
                  onValueChange={(value) => onFilterChange("difficulty", value)}
                >
                  <SelectTrigger id="difficulty" className="bg-gray-950">
                    <SelectValue placeholder="All difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_difficulties">All difficulties</SelectItem>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
        
        {/* Results section */}
        <div className="pt-3 border-t border-gray-800">
          <h4 className="text-sm font-medium mb-3">Results</h4>
          
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center">
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : searchQuery.length < 2 ? (
            <div className="text-center p-4 border border-dashed border-gray-800 rounded-lg">
              <Search className="mx-auto h-8 w-8 text-gray-600 mb-2" />
              <p className="text-muted-foreground text-sm">
                Type at least 2 characters to search
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center p-4 border border-dashed border-gray-800 rounded-lg">
              <Dumbbell className="mx-auto h-8 w-8 text-gray-600 mb-2" />
              <p className="text-muted-foreground text-sm">
                No exercises found matching your search
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {searchResults.map((exercise) => (
                <Card key={exercise.id} className="bg-gray-950 hover:bg-gray-900/50 transition-colors">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-sm">{exercise.name}</h5>
                      <p className="text-xs text-muted-foreground">
                        {exercise.prime_mover_muscle || exercise.target_muscle_group} • {exercise.primary_equipment || "Bodyweight"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onAddExercise(exercise)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseSearchPanel;
