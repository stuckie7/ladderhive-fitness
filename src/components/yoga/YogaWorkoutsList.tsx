
import React, { useState } from "react";
import { useYogaWorkouts } from "@/hooks/use-yoga-workouts";
import { YogaWorkoutCard } from "./YogaWorkoutCard";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export const YogaWorkoutsList = () => {
  const { workouts, isLoading, error, getWorkoutsByDifficulty } = useYogaWorkouts();
  const [filteredWorkouts, setFilteredWorkouts] = useState(workouts);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);

  const handleFilterByDifficulty = async (difficulty: string) => {
    if (activeFilter === difficulty) {
      // Clear filter if clicking the same one
      setActiveFilter(null);
      setFilteredWorkouts(workouts);
      return;
    }
    
    setFilterLoading(true);
    setActiveFilter(difficulty);
    
    const filtered = await getWorkoutsByDifficulty(difficulty);
    setFilteredWorkouts(filtered);
    setFilterLoading(false);
  };

  const displayedWorkouts = activeFilter ? filteredWorkouts : workouts;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* Fix: Use className to control the size instead of the size prop */}
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error Loading Yoga Workouts</h3>
        <p className="text-red-600 dark:text-red-400">{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Yoga Workouts</h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {["Beginner", "Intermediate", "Advanced"].map((difficulty) => (
            <Button
              key={difficulty}
              variant={activeFilter === difficulty ? "default" : "outline"}
              onClick={() => handleFilterByDifficulty(difficulty)}
              disabled={filterLoading}
            >
              {difficulty}
            </Button>
          ))}
          
          {activeFilter && (
            <Button
              variant="ghost"
              onClick={() => {
                setActiveFilter(null);
                setFilteredWorkouts(workouts);
              }}
            >
              Clear Filter
            </Button>
          )}
        </div>
      </div>
      
      {filterLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : displayedWorkouts.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            {activeFilter 
              ? `No ${activeFilter.toLowerCase()} yoga workouts found.` 
              : "No yoga workouts found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedWorkouts.map((workout) => (
            <YogaWorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      )}
    </div>
  );
};
