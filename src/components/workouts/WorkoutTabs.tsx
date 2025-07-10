
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Workout, UserWorkout } from "@/types/workout";
import WorkoutList from "./WorkoutList";

interface WorkoutTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  isLoading: boolean;
  workouts: Workout[];
  savedWorkouts: UserWorkout[];
  completedWorkouts: UserWorkout[];
  plannedWorkouts: UserWorkout[];
}

const WorkoutTabs = ({
  activeTab,
  setActiveTab,
  isLoading,
  workouts,
  savedWorkouts,
  completedWorkouts,
  plannedWorkouts,
}: WorkoutTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="w-full max-w-md mx-auto">
        <TabsTrigger value="all" className="flex-1">All Workouts</TabsTrigger>
        <TabsTrigger value="saved" className="flex-1">Saved</TabsTrigger>
        <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
        <TabsTrigger value="planned" className="flex-1">Planned</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-6">
        <WorkoutList 
          isLoading={isLoading}
          items={workouts}
          emptyMessage="No workouts available."
        />
      </TabsContent>
      
      <TabsContent value="saved" className="mt-6">
        <WorkoutList 
          isLoading={isLoading}
          items={savedWorkouts}
          emptyMessage="No saved workouts. Save a workout to see it here."
        />
      </TabsContent>
      
      <TabsContent value="completed" className="mt-6">
        <WorkoutList 
          isLoading={isLoading}
          items={completedWorkouts}
          emptyMessage="No completed workouts. Complete a workout to see it here."
          showDate={true}
        />
      </TabsContent>
      
      <TabsContent value="planned" className="mt-6">
        <WorkoutList 
          isLoading={isLoading}
          items={plannedWorkouts}
          emptyMessage="No planned workouts. Schedule a workout to see it here."
          showDate={true}
        />
      </TabsContent>
    </Tabs>
  );
};

export default WorkoutTabs;
