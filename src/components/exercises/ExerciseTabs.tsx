
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ExerciseCard from "./ExerciseCard";
import { Exercise } from "@/types/exercise";

interface ExerciseTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  muscleGroups: string[];
  exercises: Exercise[];
  isLoading: boolean;
  getFilteredExercises: (muscleGroup: string) => Exercise[];
  resetFilters: () => void;
}

const ExerciseTabs = ({
  activeTab,
  setActiveTab,
  muscleGroups,
  exercises,
  isLoading,
  getFilteredExercises,
  resetFilters,
}: ExerciseTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
      <TabsList className="flex overflow-x-auto pb-2 mb-4 w-full">
        <TabsTrigger value="all" className="flex-shrink-0">
          All Exercises
        </TabsTrigger>
        {muscleGroups.slice(0, 7).map((group) => (
          <TabsTrigger
            key={group}
            value={group.toLowerCase()}
            className="flex-shrink-0"
          >
            {group}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeTab} className="mt-6">
        {isLoading ? (
          <ExerciseSkeletons />
        ) : (
          <ExerciseResults
            exercises={getFilteredExercises(activeTab)}
            resetFilters={resetFilters}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

const ExerciseSkeletons = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Skeleton key={i} className="h-64 rounded-lg" />
    ))}
  </div>
);

interface ExerciseResultsProps {
  exercises: Exercise[];
  resetFilters: () => void;
}

const ExerciseResults = ({ exercises, resetFilters }: ExerciseResultsProps) => (
  <>
    {exercises.length === 0 ? (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground mb-4">
          No exercises found matching your criteria
        </p>
        <Button onClick={resetFilters} variant="outline">
          Reset Filters
        </Button>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
    )}
  </>
);

export default ExerciseTabs;
