
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
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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

  // Get filtered exercises based on active tab
  const getFilteredExercisesForTab = useCallback((tab: string) => {
    const filtered = tab === 'all' 
      ? exercises 
      : exercises.filter(ex => 
          ex.prime_mover_muscle?.toLowerCase() === tab.toLowerCase() || 
          ex.target_muscle_group?.toLowerCase() === tab.toLowerCase()
        );
    return filtered;
  }, [exercises]);

  // Get paginated exercises for the current tab
  const paginatedExercises = useMemo(() => {
    const filtered = getFilteredExercisesForTab(activeTab);
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return filtered.slice(start, end).map(mapExerciseFullToExercise);
  }, [getFilteredExercisesForTab, activeTab, pagination.currentPage, pagination.itemsPerPage]);
  
  // Get total count of filtered exercises for the active tab
  const filteredExercisesCount = useMemo(() => {
    return getFilteredExercisesForTab(activeTab).length;
  }, [getFilteredExercisesForTab, activeTab]);
  
  // Update pagination when filtered results change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalItems: filteredExercisesCount,
      totalPages: Math.max(1, Math.ceil(filteredExercisesCount / prev.itemsPerPage)),
      currentPage: Math.min(prev.currentPage, Math.ceil(filteredExercisesCount / prev.itemsPerPage) || 1)
    }));
  }, [filteredExercisesCount, pagination.itemsPerPage]);
  
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show:</span>
            <Select
              value={`${pagination.itemsPerPage}`}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="h-8 w-[80px]">
                <SelectValue aria-label={`${pagination.itemsPerPage} items per page`} />
              </SelectTrigger>
              <SelectContent>
                {[24, 48, 96, 192].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(1)}
              disabled={pagination.currentPage === 1}
              title="First page"
              aria-label="First page"
            >
              <ChevronFirst className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              title="Previous page"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            
            <div className="flex items-center gap-1 px-2">
              <span className="text-sm font-medium">Page</span>
              <Input
                type="number"
                min={1}
                max={pagination.totalPages}
                value={pagination.currentPage}
                onChange={(e) => {
                  const page = e.target.value ? Math.min(Math.max(1, Number(e.target.value)), pagination.totalPages) : 1;
                  setPage(page);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="h-8 w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label={`Current page, page ${pagination.currentPage} of ${pagination.totalPages}`}
              />
              <span className="text-sm text-muted-foreground">
                of {pagination.totalPages.toLocaleString()}
              </span>
            </div>
            
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              title="Next page"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(pagination.totalPages)}
              disabled={pagination.currentPage >= pagination.totalPages}
              title="Last page"
              aria-label={`Last page, page ${pagination.totalPages}`}
            >
              <ChevronLast className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            <span className="font-medium">
              {((pagination.currentPage - 1) * pagination.itemsPerPage + 1).toLocaleString()}
            </span>
            {' - '}
            <span className="font-medium">
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems).toLocaleString()}
            </span>
            {' of '}
            <span className="font-medium">
              {pagination.totalItems.toLocaleString()}
            </span>
            {' exercises'}
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
