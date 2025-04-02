
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
    sortOption,
    activeView,
    showFiltersPopover,
    availableMuscleGroups,
    availableEquipment,
    availableViews,
    exercises,
    isLoading,
    importDialogOpen,
    hasActiveFilters,
    setActiveTab,
    setFilters,
    setActiveView,
    setShowFiltersPopover,
    setImportDialogOpen,
    resetFilters,
    getFilteredExercises,
    handleSearchChange,
    handleSortChange
  } = useExerciseLibrary();

  // List of difficulty levels - kept here as it's static
  const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <ExerciseLibraryHeader 
          importDialogOpen={importDialogOpen}
          setImportDialogOpen={setImportDialogOpen}
          filters={filters}
          resetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
          showFiltersPopover={showFiltersPopover}
          setShowFiltersPopover={setShowFiltersPopover}
          availableViews={availableViews}
          activeView={activeView}
          setActiveView={setActiveView}
        />
        
        <SearchBar 
          searchQuery={searchQuery}
          handleSearchChange={handleSearchChange}
          sortOption={sortOption}
          handleSortChange={handleSortChange}
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
          viewMode={activeView}
        />
      </div>
    </AppLayout>
  );
};

export default ExerciseLibrary;
