
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
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    pagination,
    setActiveTab,
    setFilters,
    setPage,
    setItemsPerPage,
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
            exercises={convertedExercises}
            muscleGroups={availableMuscleGroups}
            isLoading={isLoading}
            getFilteredExercises={getFilteredExercisesAdapter}
            resetFilters={resetFilters}
          />
        </Suspense>

        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
            </span>{' '}
            of <span className="font-medium">{pagination.totalItems}</span> exercises
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${pagination.itemsPerPage}`}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pagination.itemsPerPage} />
                </SelectTrigger>
                <SelectContent>
                  {[9, 18, 27, 36].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(1)}
                disabled={pagination.currentPage === 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(Math.max(1, pagination.currentPage - 1))}
                disabled={pagination.currentPage === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center justify-center text-sm font-medium w-8">
                {pagination.currentPage}
              </div>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage(pagination.totalPages)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

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
