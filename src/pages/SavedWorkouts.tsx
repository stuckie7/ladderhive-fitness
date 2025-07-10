
import { useState, useEffect, useRef, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useSavedWorkouts } from "@/hooks/workouts/use-saved-workouts";
import SavedWorkoutCard from "@/components/workouts/SavedWorkoutCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SavedWorkouts = () => {
  const { isLoading, savedWorkouts, removeFromSaved, fetchSavedWorkouts } = useSavedWorkouts();
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  
  // List of categories for filtering
  const categories = ["strength", "cardio", "yoga", "hiit", "core"];
  
  // Get unique categories from actual data
  const availableCategories = Array.from(
    new Set(
      savedWorkouts
        .map(uw => uw.workout.category?.toLowerCase())
        .filter(Boolean)
    )
  );
  
  const handleCreateNew = () => {
    navigate("/workout-builder");
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSavedWorkouts();
    setIsRefreshing(false);
  };
  
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg">
      <Dumbbell className="h-16 w-16 mb-4 text-muted-foreground" />
      <h3 className="text-xl font-semibold mb-2">No saved workouts</h3>
      <p className="text-center text-muted-foreground mb-6">
        You haven't saved any custom workouts yet. Create your first workout to get started.
      </p>
      <Button onClick={handleCreateNew}>
        <Plus className="mr-2 h-4 w-4" />
        Create Workout
      </Button>
    </div>
  );
  
  const renderFilteredWorkouts = (category?: string) => {
    const filteredWorkouts = category
      ? savedWorkouts.filter(uw => 
          uw.workout.category?.toLowerCase() === category.toLowerCase())
      : savedWorkouts;
    
    if (filteredWorkouts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground mb-3">No workouts in this category</p>
          {category && (
            <Button variant="outline" onClick={() => setActiveTab("all")}>
              Show all workouts
            </Button>
          )}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkouts.map(userWorkout => (
          <SavedWorkoutCard
            key={userWorkout.id}
            userWorkout={userWorkout}
            onRemove={removeFromSaved}
          />
        ))}
      </div>
    );
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Saved Workouts</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your custom workout plans
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create Workout
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center p-8">
            <div className="flex justify-center mb-4">
              <Dumbbell className="h-8 w-8 animate-pulse" />
            </div>
            <p>Loading saved workouts...</p>
          </div>
        ) : savedWorkouts.length === 0 ? (
          renderEmptyState()
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="overflow-x-auto pb-2">
              <TabsList className="w-full max-w-3xl mx-auto">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                {categories
                  .filter(cat => 
                    availableCategories.includes(cat) || 
                    savedWorkouts.some(uw => 
                      uw.workout.category?.toLowerCase() === cat)
                  )
                  .map(category => (
                    <TabsTrigger 
                      key={category} 
                      value={category} 
                      className="flex-1 capitalize"
                    >
                      {category}
                    </TabsTrigger>
                  ))
                }
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-6">
              {renderFilteredWorkouts()}
            </TabsContent>
            
            {categories.map(category => (
              <TabsContent key={category} value={category} className="mt-6">
                {renderFilteredWorkouts(category)}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
};

export default SavedWorkouts;
