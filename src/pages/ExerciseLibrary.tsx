import React, { Suspense, lazy } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { useExerciseLibrary } from "@/hooks/exercise-library";
import { useState } from "react";

const ExerciseLibraryHeader = lazy(() => import("@/components/exercises/ExerciseLibraryHeader"));
const SearchBar = lazy(() => import("@/components/exercises/SearchBar"));
const ExerciseFilters = lazy(() => import("@/components/exercises/ExerciseFilters"));
const ExerciseTabs = lazy(() => import("@/components/exercises/ExerciseTabs"));
const ExercisesFullTable = lazy(() => import("@/components/exercises/ExercisesFullTable"));

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

        <Suspense fallback={<div className="h-12" />}>
          <ExerciseLibraryHeader 
            importDialogOpen={importDialogOpen}
            setImportDialogOpen={setImportDialogOpen}
          />
        </Suspense>
        
        <Suspense fallback={<div className="h-10 mb-4" />}>
          <SearchBar 
            searchQuery={searchQuery}
            handleSearchChange={handleSearchChange}
          />
        </Suspense>
        
        <Suspense fallback={<div className="h-32 mb-4" />}>
          <ExerciseFilters 
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            muscleGroups={availableMuscleGroups}
            equipmentTypes={availableEquipment}
            difficultyLevels={DIFFICULTY_LEVELS}
          />
        </Suspense>
        
        <Suspense fallback={<div className="h-64" />}>
          <ExerciseTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            muscleGroups={availableMuscleGroups}
            exercises={exercises}
            isLoading={isLoading}
            getFilteredExercises={getFilteredExercises}
            resetFilters={resetFilters}
          />
        </Suspense>

        <ExercisesFullTable />
      </div>
    </AppLayout>
  );
};

export default ExerciseLibrary;
