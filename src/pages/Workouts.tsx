
import React, { useState, useEffect, useRef, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Loader } from "lucide-react";
import { WorkoutFilterBar } from "@/components/workouts/filters/WorkoutFilterBar";
import { useWorkoutBrowser } from "@/hooks/useWorkoutBrowser";
import WorkoutCard from "@/components/workouts/WorkoutCard";
import { WorkoutPagination } from "@/components/workouts/pagination/WorkoutPagination";

const Workouts = () => {
  const {
    workouts,
    totalWorkouts,
    isLoading,
    currentPage,
    itemsPerPage,
    filters,
    activeFilterCount,
    handleFilterChange,
    handlePageChange
  } = useWorkoutBrowser();

  const [isFilterBarSticky, setIsFilterBarSticky] = useState(false);
  const [paginationType, setPaginationType] = useState<'classic' | 'loadMore'>('classic');
  const filterBarRef = useRef<HTMLDivElement>(null);
  const scrollThreshold = useRef<number | null>(null);

  // Set up scroll observer for sticky filter bar
  useEffect(() => {
    const handleScroll = () => {
      if (filterBarRef.current && scrollThreshold.current === null) {
        // Initialize threshold value on first scroll
        scrollThreshold.current = filterBarRef.current.offsetTop;
      }

      if (scrollThreshold.current !== null) {
        setIsFilterBarSticky(window.scrollY > scrollThreshold.current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lazy loading for images using Intersection Observer
  const setupLazyLoading = useCallback(() => {
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });

      lazyImages.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers without Intersection Observer
      document.querySelectorAll('img[data-src]').forEach(img => {
        const imgEl = img as HTMLImageElement;
        imgEl.src = imgEl.dataset.src || '';
        imgEl.removeAttribute('data-src');
      });
    }
  }, []);

  useEffect(() => {
    setupLazyLoading();
  }, [workouts, setupLazyLoading]);

  // Toggle between pagination types
  const togglePaginationType = () => {
    setPaginationType(prev => prev === 'classic' ? 'loadMore' : 'classic');
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold gradient-heading">Workouts</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={togglePaginationType}
              className="hidden sm:flex"
            >
              {paginationType === 'classic' ? 'Use Load More' : 'Use Classic Pagination'}
            </Button>
            <Link to="/workout-builder">
              <Button className="btn-fitness-primary">
                <Plus className="mr-2 h-4 w-4" />
                Create Workout
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter bar - will become sticky on scroll */}
        <div ref={filterBarRef}>
          <WorkoutFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            activeFilterCount={activeFilterCount}
            isSticky={isFilterBarSticky}
          />
        </div>

        {/* Workout grid */}
        <div className="mt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="h-10 w-10 animate-spin mb-4 text-fitness-primary" />
              <p className="text-muted-foreground">Loading workouts...</p>
            </div>
          ) : workouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {workouts.map((workout) => (
                <WorkoutCard 
                  key={workout.id} 
                  workout={workout} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">No workouts found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or create a new workout
              </p>
              <Button asChild>
                <Link to="/workout-builder">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workout
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {workouts.length > 0 && !isLoading && (
          <WorkoutPagination
            totalItems={totalWorkouts}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            paginationType={paginationType}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Workouts;
