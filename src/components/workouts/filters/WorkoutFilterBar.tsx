
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";

export interface WorkoutFilters {
  search: string;
  focusArea: string[];
  difficulty: string[];
  duration: string[];
  equipment: string[];
  special: string[];
}

interface WorkoutFilterBarProps {
  filters: WorkoutFilters;
  onFilterChange: (filters: WorkoutFilters) => void;
  activeFilterCount: number;
  isSticky?: boolean;
}

const focusAreas = ["Strength", "Cardio", "Yoga", "HIIT", "Core", "Full Body", "Upper Body", "Lower Body"];
const difficulties = ["Beginner", "Intermediate", "Advanced", "Elite"];
const durations = ["<15min", "15-30min", "30-45min", "45+min"];
const equipmentOptions = ["None", "Dumbbells", "Bands", "Kettlebell", "Barbell", "Bodyweight"];
const specialFilters = ["With Videos", "New This Week", "Saved"];

export const WorkoutFilterBar = ({ 
  filters, 
  onFilterChange, 
  activeFilterCount,
  isSticky = false 
}: WorkoutFilterBarProps) => {
  const [searchValue, setSearchValue] = useState(filters.search);

  // Update search when user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFilterChange({
          ...filters,
          search: searchValue
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, filters, onFilterChange]);

  // Update local search value when filters change externally
  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleFilterChange = (
    category: keyof Omit<WorkoutFilters, "search">,
    value: string,
    isActive: boolean
  ) => {
    let newValues = [...filters[category]];
    
    if (isActive) {
      newValues = newValues.filter((item) => item !== value);
    } else {
      newValues.push(value);
    }
    
    onFilterChange({
      ...filters,
      [category]: newValues,
    });
  };

  const resetFilters = () => {
    setSearchValue("");
    onFilterChange({
      search: "",
      focusArea: [],
      difficulty: [],
      duration: [],
      equipment: [],
      special: [],
    });
  };

  return (
    <div className={`bg-background/95 backdrop-blur-sm w-full py-4 z-10 border-b ${isSticky ? "sticky top-0" : ""}`}>
      <div className="container mx-auto">
        <div className="flex flex-col space-y-4">
          {/* Search and reset controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workouts..."
                className="pl-10"
                value={searchValue}
                onChange={handleSearchChange}
              />
            </div>
            
            <Button 
              variant="outline" 
              onClick={resetFilters}
              disabled={activeFilterCount === 0}
              className="whitespace-nowrap"
            >
              <X className="mr-2 h-4 w-4" />
              Reset {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </div>
          
          {/* Filter dropdowns */}
          <div className="flex flex-wrap gap-2">
            <FilterSelect 
              label="Focus Area"
              options={focusAreas}
              selected={filters.focusArea}
              onChange={(value, isActive) => handleFilterChange("focusArea", value, isActive)}
            />
            
            <FilterSelect 
              label="Difficulty"
              options={difficulties}
              selected={filters.difficulty}
              onChange={(value, isActive) => handleFilterChange("difficulty", value, isActive)}
            />
            
            <FilterSelect 
              label="Duration"
              options={durations}
              selected={filters.duration}
              onChange={(value, isActive) => handleFilterChange("duration", value, isActive)}
            />
            
            <FilterSelect 
              label="Equipment"
              options={equipmentOptions}
              selected={filters.equipment}
              onChange={(value, isActive) => handleFilterChange("equipment", value, isActive)}
            />
            
            <FilterSelect 
              label="Special"
              options={specialFilters}
              selected={filters.special}
              onChange={(value, isActive) => handleFilterChange("special", value, isActive)}
            />
          </div>
          
          {/* Active filter badges */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(filters).map(([category, values]) => {
                if (category === "search" && values) {
                  return (
                    <Badge key="search" variant="secondary" className="flex items-center gap-1">
                      Search: {values}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => onFilterChange({...filters, search: ""})}
                      />
                    </Badge>
                  );
                }
                
                if (Array.isArray(values) && values.length > 0) {
                  return values.map(value => (
                    <Badge key={`${category}-${value}`} variant="secondary" className="flex items-center gap-1">
                      {value}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => 
                          handleFilterChange(
                            category as keyof Omit<WorkoutFilters, "search">, 
                            value, 
                            true
                          )
                        }
                      />
                    </Badge>
                  ));
                }
                
                return null;
              })}
              
              {activeFilterCount > 1 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs" 
                  onClick={resetFilters}
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface FilterSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string, isActive: boolean) => void;
}

const FilterSelect = ({ label, options, selected, onChange }: FilterSelectProps) => {
  return (
    <div className="flex-shrink-0">
      <Select>
        <SelectTrigger className="h-8 min-w-[140px] border-dashed">
          <span className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            {label} {selected.length > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1">{selected.length}</Badge>}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label}</SelectLabel>
            {options.map((option) => {
              const isActive = selected.includes(option);
              return (
                <SelectItem 
                  key={option} 
                  value={option}
                  onClick={() => onChange(option, isActive)}
                  className={isActive ? "bg-accent text-accent-foreground" : ""}
                >
                  <span className="flex items-center gap-2">
                    {isActive && <div className="h-2 w-2 rounded-full bg-primary" />}
                    {option}
                  </span>
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
