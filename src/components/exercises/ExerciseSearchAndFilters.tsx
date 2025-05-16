
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { ChangeEvent } from "react";

interface ExerciseFilters {
  muscleGroup: string;
  equipment: string;
  difficulty: string;
}

interface ExerciseSearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  filters: ExerciseFilters;
  muscleGroups: string[];
  equipmentTypes: string[];
  difficultyLevels: string[];
  onFilterChange: (key: keyof ExerciseFilters, value: string) => void;
  onResetFilters: () => void;
}

const ExerciseSearchAndFilters = ({
  searchQuery,
  onSearchChange,
  filters,
  muscleGroups,
  equipmentTypes,
  difficultyLevels,
  onFilterChange,
  onResetFilters
}: ExerciseSearchAndFiltersProps) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search exercises by name"
            className="pl-10"
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onResetFilters} 
            className="whitespace-nowrap"
          >
            Reset Filters
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-lg">
        <div className="space-y-2">
          <label className="text-sm font-medium">Muscle Group</label>
          <Select
            value={filters.muscleGroup}
            onValueChange={(value) => onFilterChange("muscleGroup", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All muscle groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All muscle groups</SelectItem>
              {muscleGroups.map((group) => (
                <SelectItem key={group} value={group}>{group}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Equipment</label>
          <Select
            value={filters.equipment}
            onValueChange={(value) => onFilterChange("equipment", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All equipment</SelectItem>
              {equipmentTypes.map((equipment) => (
                <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Difficulty</label>
          <Select
            value={filters.difficulty}
            onValueChange={(value) => onFilterChange("difficulty", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All difficulties</SelectItem>
              {difficultyLevels.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ExerciseSearchAndFilters;
