
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ExerciseCard from "./ExerciseCard";
import { Exercise } from "@/types/exercise";

interface ExerciseTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  muscleGroups: string[];
  exercises: Exercise[] | undefined;
  isLoading: boolean;
  getFilteredExercises: (muscleGroup: string) => Exercise[];
  resetFilters: () => void;
  viewMode?: string;
}

const ExerciseTabs = ({
  activeTab,
  setActiveTab,
  muscleGroups,
  exercises,
  isLoading,
  getFilteredExercises,
  resetFilters,
  viewMode = "grid",
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
          <ExerciseSkeletons viewMode={viewMode} />
        ) : (
          <ExerciseResults
            exercises={getFilteredExercises(activeTab)}
            resetFilters={resetFilters}
            viewMode={viewMode}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

interface ExerciseSkeletonsProps {
  viewMode?: string;
}

const ExerciseSkeletons = ({ viewMode = "grid" }: ExerciseSkeletonsProps) => (
  <div className={viewMode === "grid" 
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
    : "space-y-4"
  }>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Skeleton key={i} className={viewMode === "grid" ? "h-64 rounded-lg" : "h-24 rounded-lg"} />
    ))}
  </div>
);

interface ExerciseResultsProps {
  exercises: Exercise[];
  resetFilters: () => void;
  viewMode?: string;
}

const ExerciseResults = ({ exercises, resetFilters, viewMode = "grid" }: ExerciseResultsProps) => (
  <>
    <p className="mb-4 text-muted-foreground">
      Showing {exercises.length} exercises
    </p>
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
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        {exercises.map((exercise) => (
          <ExerciseCard 
            key={exercise.id} 
            exercise={exercise} 
            variant={viewMode === "grid" ? "card" : "list"} 
          />
        ))}
      </div>
    )}
  </>
);

export default ExerciseTabs;
