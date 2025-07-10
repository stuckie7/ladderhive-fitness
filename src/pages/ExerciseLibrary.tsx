
import React, { Suspense, lazy, useEffect, useMemo, useCallback, ChangeEvent } from "react";
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
import ExercisePagination from "@/components/exercises/ExercisePagination";

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
    setPagination
  } = useExerciseLibrary();
  
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const goToEnhancedLibrary = () => {
    navigate("/exercises/enhanced");
  };

  // Get filtered exercises based on active tab - memoize to prevent infinite loops
  const getFilteredExercisesForTab = useCallback((tab: string) => {
    const filtered = tab === 'all' 
      ? exercises 
      : exercises.filter(ex => 
          ex.prime_mover_muscle?.toLowerCase() === tab.toLowerCase() || 
          ex.target_muscle_group?.toLowerCase() === tab.toLowerCase()
        );
    return filtered;
  }, [exercises]);

  // Get paginated exercises for the current tab - memoize result
  const paginatedExercises = useMemo(() => {
    const filtered = getFilteredExercisesForTab(activeTab);
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return filtered.slice(start, end).map(mapExerciseFullToExercise);
  }, [getFilteredExercisesForTab, activeTab, pagination.currentPage, pagination.itemsPerPage]);
  
  // Get total count of filtered exercises for the active tab - memoize result
  const filteredExercisesCount = useMemo(() => {
    return getFilteredExercisesForTab(activeTab).length;
  }, [getFilteredExercisesForTab, activeTab]);
  
  // Update pagination when filtered results change - using memoized value to prevent loops
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredExercisesCount / pagination.itemsPerPage));
    const currentPage = Math.min(pagination.currentPage, totalPages || 1);
    
    // Only update if values actually changed to prevent unnecessary rerenders
    if (pagination.totalItems !== filteredExercisesCount || 
        pagination.totalPages !== totalPages || 
        pagination.currentPage !== currentPage) {
      setPagination(prev => ({
        ...prev,
        totalItems: filteredExercisesCount,
        totalPages: totalPages,
        currentPage: currentPage
      }));
    }
  }, [filteredExercisesCount, pagination.itemsPerPage, pagination.currentPage, pagination.totalItems, pagination.totalPages, setPagination]);
  
  // Event handler adapter for SearchBar
  const handleSearchChangeAdapter = (e: ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(e.target.value);
    setPage(1); // Reset to first page when search changes
  };
  
  // Adapter function for getFilteredExercises (used by ExerciseTabs)
  const getFilteredExercisesAdapter = useCallback((tab: string): Exercise[] => {
    if (!tab) return [];
    return getFilteredExercisesForTab(tab).map(mapExerciseFullToExercise);
  }, [getFilteredExercisesForTab]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (pageSize: number) => {
    setItemsPerPage(pageSize);
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
            exercises={paginatedExercises}
            muscleGroups={availableMuscleGroups}
            isLoading={isLoading}
            getFilteredExercises={getFilteredExercisesAdapter}
            resetFilters={() => {
              resetFilters();
              setPage(1);
            }}
          />
        </Suspense>

        {/* Enhanced Pagination Controls */}
        <ExercisePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />

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
