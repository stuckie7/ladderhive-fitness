import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { useExerciseLibrary } from "@/hooks/exercise-library";
import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import components for better code splitting
const ExerciseLibraryHeader = dynamic(
  () => import("@/components/exercises/ExerciseLibraryHeader"),
  { loading: () => <div className="h-12" /> }
);

const SearchBar = dynamic(
  () => import("@/components/exercises/SearchBar"),
  { loading: () => <div className="h-10 mb-4" /> }
);

const ExerciseFilters = dynamic(
  () => import("@/components/exercises/ExerciseFilters"),
  { loading: () => <div className="h-32 mb-4" /> }
);

const ExerciseTabs = dynamic(
  () => import("@/components/exercises/ExerciseTabs"),
  { loading: () => <div className="h-64" /> }
);

const DIFFICULTY_LEVELS: ("Beginner" | "Intermediate" | "Advanced")[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

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
    handleSearchChange,
  } = useExerciseLibrary();
  
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">Exercise Library</h1>
          <Badge variant="secondary" className="mb-2 md:mb-0">
            Powered by Supabase Exercise Data
          </Badge>
        </div>
        
        {/* Exercise Library Components */}
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
          difficultyLevels={DIFFICULTY_LEVELS}
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
