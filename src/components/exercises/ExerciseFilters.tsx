
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterX } from "lucide-react";

interface FiltersState {
  muscleGroup: string;
  equipment: string;
  difficulty: string;
}

interface ExerciseFiltersProps {
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
  resetFilters: () => void;
  muscleGroups: string[];
  equipmentTypes: string[];
  difficultyLevels: string[];
}

const ExerciseFilters = ({
  filters,
  setFilters,
  resetFilters,
  muscleGroups,
  equipmentTypes,
  difficultyLevels,
}: ExerciseFiltersProps) => {
  const handleFilterChange = (key: keyof FiltersState, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const hasActiveFilters = filters.muscleGroup || filters.equipment || filters.difficulty;

  return (
    <div className="bg-muted/30 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="text-sm flex items-center gap-1"
          >
            <FilterX className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Muscle Group</label>
          <Select
            value={filters.muscleGroup}
            onValueChange={(value) => handleFilterChange("muscleGroup", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All muscle groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All muscle groups</SelectItem>
              {muscleGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Equipment</label>
          <Select
            value={filters.equipment}
            onValueChange={(value) => handleFilterChange("equipment", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All equipment</SelectItem>
              {equipmentTypes.map((equipment) => (
                <SelectItem key={equipment} value={equipment}>
                  {equipment}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Difficulty</label>
          <Select
            value={filters.difficulty}
            onValueChange={(value) => handleFilterChange("difficulty", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All difficulties</SelectItem>
              {difficultyLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ExerciseFilters;
