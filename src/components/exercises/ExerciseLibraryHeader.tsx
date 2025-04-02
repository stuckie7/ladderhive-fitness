
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Filter, X } from "lucide-react";
import ExcelImport from "./ExcelImport";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ExerciseFilters } from "@/types/exercise";

interface ExerciseLibraryHeaderProps {
  importDialogOpen: boolean;
  setImportDialogOpen: (open: boolean) => void;
  filters: ExerciseFilters;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  showFiltersPopover: boolean;
  setShowFiltersPopover: (show: boolean) => void;
  availableViews: string[];
  activeView: string;
  setActiveView: (view: string) => void;
}

const ExerciseLibraryHeader = ({ 
  importDialogOpen, 
  setImportDialogOpen,
  filters,
  resetFilters,
  hasActiveFilters,
  showFiltersPopover,
  setShowFiltersPopover,
  availableViews,
  activeView,
  setActiveView
}: ExerciseLibraryHeaderProps) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Exercise Library</h1>
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex gap-2">
              <Upload size={16} />
              <span>Import Excel</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Import Exercises from Excel</DialogTitle>
            </DialogHeader>
            <ExcelImport />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={activeView} onValueChange={(value) => value && setActiveView(value)}>
            {availableViews.map((view) => (
              <ToggleGroupItem key={view} value={view} aria-label={`View as ${view}`}>
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="h-8 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear filters
            </Button>
          )}
          
          <Popover open={showFiltersPopover} onOpenChange={setShowFiltersPopover}>
            <PopoverTrigger asChild>
              <Button 
                variant={hasActiveFilters ? "default" : "outline"} 
                size="sm"
                className="h-8"
              >
                <Filter className="h-3.5 w-3.5 mr-1" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 px-1 rounded-sm">
                    {Object.values(filters).filter(f => f !== "all_muscle_groups" && f !== "all_equipment" && f !== "all_difficulties").length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[300px] p-0">
              <div className="p-4 border-b">
                <h4 className="font-medium">Active Filters</h4>
              </div>
              <div className="p-2">
                {filters.muscleGroup !== "all_muscle_groups" && (
                  <Badge variant="outline" className="m-1">
                    {filters.muscleGroup}
                  </Badge>
                )}
                {filters.equipment !== "all_equipment" && (
                  <Badge variant="outline" className="m-1">
                    {filters.equipment}
                  </Badge>
                )}
                {filters.difficulty !== "all_difficulties" && (
                  <Badge variant="outline" className="m-1">
                    {filters.difficulty}
                  </Badge>
                )}
                {!hasActiveFilters && (
                  <p className="text-sm text-muted-foreground p-2">No active filters</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibraryHeader;
