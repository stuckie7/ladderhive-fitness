
import React, { Suspense, lazy, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { useExerciseLibrary } from "@/hooks/exercise-library";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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

  const goToEnhancedLibrary = () => {
    navigate("/exercise-library");
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">Exercise Library</h1>
          <div className="flex gap-2">
            <Badge variant="secondary" className="mb-2 md:mb-0">
              Powered by Supabase Exercise Data
            </Badge>
            <Button onClick={goToEnhancedLibrary} variant="outline">
              Enhanced Library
            </Button>
          </div>
        </div>

        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <ExerciseLibraryHeader 
            importDialogOpen={importDialogOpen}
            setImportDialogOpen={setImportDialogOpen}
          />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-10 w-full mb-4" />}>
          <SearchBar 
            searchQuery={searchQuery}
            handleSearchChange={handleSearchChange}
          />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-32 w-full mb-4" />}>
          <ExerciseFilters 
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            muscleGroups={availableMuscleGroups}
            equipmentTypes={availableEquipment}
            difficultyLevels={DIFFICULTY_LEVELS}
          />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
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

        <div className="mt-12 pt-6 border-t">
          <h2 className="text-xl font-semibold mb-4">Complete Exercise Database</h2>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ExercisesFullTable />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
};

export default ExerciseLibrary;
