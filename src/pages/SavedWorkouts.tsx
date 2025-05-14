
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useSavedWorkouts } from "@/hooks/workouts/use-saved-workouts";
import SavedWorkoutCard from "@/components/workouts/SavedWorkoutCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SavedWorkouts = () => {
  const { isLoading, savedWorkouts, removeFromSaved } = useSavedWorkouts();
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  
  const handleCreateNew = () => {
    navigate("/workout-builder");
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
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create Workout
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full max-w-md mx-auto">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="strength" className="flex-1">Strength</TabsTrigger>
            <TabsTrigger value="cardio" className="flex-1">Cardio</TabsTrigger>
            <TabsTrigger value="yoga" className="flex-1">Yoga</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="text-center p-8">Loading saved workouts...</div>
            ) : savedWorkouts.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedWorkouts.map(userWorkout => (
                  <SavedWorkoutCard
                    key={userWorkout.id}
                    userWorkout={userWorkout}
                    onRemove={removeFromSaved}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="strength" className="mt-6">
            {isLoading ? (
              <div className="text-center p-8">Loading saved workouts...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedWorkouts
                  .filter(uw => uw.workout.category?.toLowerCase() === 'strength')
                  .map(userWorkout => (
                    <SavedWorkoutCard
                      key={userWorkout.id}
                      userWorkout={userWorkout}
                      onRemove={removeFromSaved}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="cardio" className="mt-6">
            {isLoading ? (
              <div className="text-center p-8">Loading saved workouts...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedWorkouts
                  .filter(uw => uw.workout.category?.toLowerCase() === 'cardio')
                  .map(userWorkout => (
                    <SavedWorkoutCard
                      key={userWorkout.id}
                      userWorkout={userWorkout}
                      onRemove={removeFromSaved}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="yoga" className="mt-6">
            {isLoading ? (
              <div className="text-center p-8">Loading saved workouts...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedWorkouts
                  .filter(uw => uw.workout.category?.toLowerCase() === 'yoga')
                  .map(userWorkout => (
                    <SavedWorkoutCard
                      key={userWorkout.id}
                      userWorkout={userWorkout}
                      onRemove={removeFromSaved}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SavedWorkouts;
