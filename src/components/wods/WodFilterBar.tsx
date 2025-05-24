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
import { WodFilters } from "@/types/wod";

interface WodFilterBarProps {
  filters: WodFilters;
  onFilterChange: (filters: WodFilters) => void;
  activeFilterCount: number;
  isSticky?: boolean;
}

const categories = [
  "Girl WODs",
  "Hero WODs",
  "Benchmark",
  "AMRAP",
  "EMOM",
  "For Time",
  "Chipper",
  "Ladder"
];

const difficulties = ["Beginner", "Intermediate", "Advanced", "Elite"];
const durations = ["<15min", "15-30min", "30-45min", "45+min"];
const equipmentOptions = ["None", "Barbell", "Dumbbells", "Kettlebell", "Rings", "Rower", "Bike", "Ski Erg"];
const specialFilters = ["With Videos", "New This Week", "Saved"];

export const WodFilterBar = ({ 
  filters, 
  onFilterChange, 
  activeFilterCount,
  isSticky = false 
}: WodFilterBarProps) => {
  const [searchValue, setSearchValue] = useState(filters.search || '');

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleFilterChange = (
    category: keyof Omit<WodFilters, "search">,
    value: string,
    isActive: boolean
  ) => {
    // Type assertion to handle the readonly arrays
    const currentValues = [...(filters[category] || [])] as string[];
    let newValues: string[];
    
    if (isActive) {
      newValues = currentValues.filter((item: string) => item !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    onFilterChange({
      ...filters,
      [category]: newValues,
    });
  };

  const resetFilters = () => {
    onFilterChange({
      search: "",
      difficulty: [],
      category: [],
      duration: [],
      equipment: [],
      special: []
    });
    setSearchValue("");
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
                placeholder="Search WODs..."
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
              label="Category"
              options={categories}
              selected={filters.category || []}
              onChange={(value, isActive) => handleFilterChange("category", value, isActive)}
            />
            
            <FilterSelect 
              label="Difficulty"
              options={difficulties}
              selected={filters.difficulty || []}
              onChange={(value, isActive) => handleFilterChange("difficulty", value, isActive)}
            />
            
            <FilterSelect 
              label="Duration"
              options={durations}
              selected={filters.duration || []}
              onChange={(value, isActive) => handleFilterChange("duration", value, isActive)}
            />
            
            <FilterSelect 
              label="Equipment"
              options={equipmentOptions}
              selected={filters.equipment || []}
              onChange={(value, isActive) => handleFilterChange("equipment", value, isActive)}
            />
            
            <FilterSelect 
              label="Special"
              options={specialFilters}
              selected={filters.special || []}
              onChange={(value, isActive) => handleFilterChange("special", value, isActive)}
            />
          </div>
          
          {/* Active filter badges */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(filters).map(([category, values]) => {
                if (!values) return null;
                
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
                            category as keyof Omit<WodFilters, "search">, 
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
                  className="h-6 px-2 text-xs"
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
    <Select
      onValueChange={(value) => {
        const isActive = selected.includes(value);
        onChange(value, isActive);
      }}
    >
      <SelectTrigger className="w-[180px] h-9">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{label}</span>
          {selected.length > 0 && (
            <Badge variant="secondary" className="h-4 w-4 p-0 flex items-center justify-center">
              {selected.length}
            </Badge>
          )}
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {options.map((option) => (
            <SelectItem 
              key={option} 
              value={option}
              className={selected.includes(option) ? "bg-muted" : ""}
            >
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default WodFilterBar;
