
import AppLayout from "@/components/layout/AppLayout";
import ExerciseFilters from "@/components/exercises/ExerciseFilters";
import SearchBar from "@/components/exercises/SearchBar";
import ExerciseTabs from "@/components/exercises/ExerciseTabs";
import ExerciseLibraryHeader from "@/components/exercises/ExerciseLibraryHeader";
import { useExerciseLibrary } from "@/hooks/use-exercise-library";

const ExerciseLibrary = () => {
  const {
    searchQuery,
    activeTab,
    filters,
    availableMuscleGroups,
    availableEquipment,
    exercises,
    isLoading,
    importDialogOpen,
    setActiveTab,
    setFilters,
    setImportDialogOpen,
    resetFilters,
    getFilteredExercises,
    handleSearchChange
  } = useExerciseLibrary();

  // List of difficulty levels - kept here as it's static
  const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
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
