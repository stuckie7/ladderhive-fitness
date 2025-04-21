
import AppLayout from "@/components/layout/AppLayout";
import ExerciseFilters from "@/components/exercises/ExerciseFilters";
import SearchBar from "@/components/exercises/SearchBar";
import ExerciseTabs from "@/components/exercises/ExerciseTabs";
import ExerciseLibraryHeader from "@/components/exercises/ExerciseLibraryHeader";
import { useExerciseLibrary } from "@/hooks/exercise-library";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const ExerciseLibrary = () => {
  const {
    searchQuery,
    activeTab,
    filters,
    availableMuscleGroups,
    availableEquipment,
    exercises,
    isLoading,
    setActiveTab,
    setFilters,
    resetFilters,
    getFilteredExercises,
    handleSearchChange
  } = useExerciseLibrary();
  
  // Added state for import dialog (not actually used but needed for props)
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // List of difficulty levels - kept here as it's static
  const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">Exercise Library</h1>
          <Badge variant="secondary" className="mb-2 md:mb-0">
            Powered by Supabase Exercise Data
          </Badge>
        </div>
        
        <ExerciseLibraryHeader 
          importDialogOpen={importDialogOpen}
          setImportDialogOpen={setImportDialogOpen}
        />
        
        <SearchBar 
          searchQuery={searchQuery}
          handleSearchChange={handleSearchChange}
        />
        
        <ExerciseFilters 
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
          muscleGroups={availableMuscleGroups}
          equipmentTypes={availableEquipment}
          difficultyLevels={difficultyLevels}
        />
        
        <ExerciseTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          muscleGroups={availableMuscleGroups}
          exercises={exercises}
          isLoading={isLoading}
          getFilteredExercises={getFilteredExercises}
          resetFilters={resetFilters}
        />
      </div>
    </AppLayout>
  );
};

export default ExerciseLibrary;
