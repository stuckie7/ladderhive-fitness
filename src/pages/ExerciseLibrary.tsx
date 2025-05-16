
import React, { Suspense, lazy, useEffect, ChangeEvent } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { useExerciseLibrary } from "@/hooks/exercise-library";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { mapExerciseFullToExercise } from "@/hooks/exercise-library/mappers";
import { Exercise, ExerciseFull } from "@/types/exercise";
import { ArrowRight } from "lucide-react";

const ExerciseLibraryHeader = lazy(() => import("@/components/exercises/ExerciseLibraryHeader"));
const SearchBar = lazy(() => import("@/components/exercises/SearchBar"));
const ExerciseFilters = lazy(() => import("@/components/exercises/ExerciseFilters"));
const ExerciseTabs = lazy(() => import("@/components/exercises/ExerciseTabs"));

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
    navigate("/exercises/enhanced");
  };

  // Adapter function to convert ExerciseFull[] to Exercise[]
  const convertedExercises = exercises.map(mapExerciseFullToExercise);
  
  // Event handler adapter for SearchBar
  const handleSearchChangeAdapter = (e: ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(e.target.value);
  };
  
  // Adapter function for getFilteredExercises
  const getFilteredExercisesAdapter = (muscleGroup: string): Exercise[] => {
    return getFilteredExercises(muscleGroup).map(mapExerciseFullToExercise);
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
            handleSearchChange={handleSearchChangeAdapter}
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
            exercises={convertedExercises}
            isLoading={isLoading}
            getFilteredExercises={getFilteredExercisesAdapter}
            resetFilters={resetFilters}
          />
        </Suspense>

        <div className="mt-12 pt-6 border-t">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Complete Exercise Database</h2>
              <p className="text-muted-foreground mb-4">
                Access our comprehensive enhanced exercise library with advanced filtering and detailed information
              </p>
            </div>
            <Button 
              onClick={goToEnhancedLibrary} 
              className="bg-fitness-primary hover:bg-fitness-primary/90"
            >
              Go to Enhanced Library
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 p-6 border rounded-lg bg-muted/20 text-center">
            <p>
              Our enhanced exercise library provides detailed information about exercises,
              including videos, muscle targeting, difficulty levels, and more.
            </p>
            <Button 
              onClick={goToEnhancedLibrary} 
              variant="outline" 
              className="mt-4"
            >
              Explore Enhanced Library
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ExerciseLibrary;
