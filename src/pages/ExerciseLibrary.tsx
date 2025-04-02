
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import ExerciseFilters from "@/components/exercises/ExerciseFilters";
import ExerciseCard from "@/components/exercises/ExerciseCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload } from "lucide-react";
import { useExercises } from "@/hooks/use-exercises";
import { Exercise, ExerciseFilters as Filters } from "@/types/exercise";
import { getBodyParts, getEquipmentList } from "@/integrations/exercisedb/client";

// We'll fetch these from the API, but default to static lists initially
const muscleGroups = [
  "Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Full Body", "Cardio"
];

const equipmentTypes = [
  "Bodyweight", "Dumbbells", "Barbell", "Kettlebell", "Resistance Bands", 
  "Cable Machine", "Smith Machine", "Machine", "Medicine Ball", "Foam Roller"
];

const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];

const ExerciseLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<Filters>({
    muscleGroup: "",
    equipment: "",
    difficulty: ""
  });
  const [availableMuscleGroups, setAvailableMuscleGroups] = useState<string[]>(muscleGroups);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>(equipmentTypes);
  const { getExercisesByMuscleGroup, getExercisesByEquipment, searchExercises } = useExercises();

  // Fetch available muscle groups and equipment from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [bodyParts, equipment] = await Promise.all([
          getBodyParts(),
          getEquipmentList()
        ]);
        
        if (bodyParts.length) {
          // Capitalize first letter of each body part for display
          setAvailableMuscleGroups(
            bodyParts.map(part => part.charAt(0).toUpperCase() + part.slice(1))
          );
        }
        
        if (equipment.length) {
          // Capitalize first letter of each equipment for display
          setAvailableEquipment(
            equipment.map(eq => eq.charAt(0).toUpperCase() + eq.slice(1))
          );
        }
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };
    
    fetchFilterOptions();
  }, []);

  const fetchExercises = async () => {
    if (searchQuery) {
      return await searchExercises(searchQuery);
    }
    
    if (filters.muscleGroup) {
      return await getExercisesByMuscleGroup(filters.muscleGroup.toLowerCase());
    }
    
    if (filters.equipment) {
      return await getExercisesByEquipment(filters.equipment.toLowerCase());
    }
    
    // Default: fetch exercises for the first muscle group
    const firstBodyPart = availableMuscleGroups[0]?.toLowerCase() || 'back';
    const exercises = await getExercisesByMuscleGroup(firstBodyPart);
    
    let filteredData = exercises;
    
    // Apply client-side filtering for difficulty if set
    if (filters.difficulty) {
      filteredData = filteredData.filter(ex => 
        ex.difficulty === filters.difficulty
      );
    }
    
    return filteredData;
  };

  const { data: exercises, isLoading, refetch } = useQuery({
    queryKey: ['exercises', filters, searchQuery, availableMuscleGroups[0]],
    queryFn: fetchExercises,
    enabled: availableMuscleGroups.length > 0 // Only run query when we have muscle groups
  });

  const resetFilters = () => {
    setFilters({
      muscleGroup: "",
      equipment: "",
      difficulty: ""
    });
    setSearchQuery("");
  };

  const getFilteredExercises = (muscleGroup: string) => {
    if (!exercises) return [];
    
    if (muscleGroup === "all") {
      return exercises;
    }
    
    return exercises.filter(ex => 
      ex.muscle_group?.toLowerCase() === muscleGroup.toLowerCase() ||
      ex.bodyPart?.toLowerCase() === muscleGroup.toLowerCase()
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    refetch();
  }, [filters, searchQuery, refetch]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Exercise Library</h1>
          <Link to="/exercises/import">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Exercises
            </Button>
          </Link>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        
        <ExerciseFilters 
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
          muscleGroups={availableMuscleGroups}
          equipmentTypes={availableEquipment}
          difficultyLevels={difficultyLevels}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="flex overflow-x-auto pb-2 mb-4 w-full">
            <TabsTrigger value="all" className="flex-shrink-0">All Exercises</TabsTrigger>
            {availableMuscleGroups.slice(0, 7).map(group => (
              <TabsTrigger key={group} value={group.toLowerCase()} className="flex-shrink-0">
                {group}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-64 rounded-lg bg-muted animate-pulse"></div>
                ))}
              </div>
            ) : (
              <>
                <p className="mb-4 text-muted-foreground">
                  Showing {getFilteredExercises(activeTab).length} exercises
                </p>
                {getFilteredExercises(activeTab).length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-lg text-muted-foreground mb-4">No exercises found matching your criteria</p>
                    <Button onClick={resetFilters} variant="outline">Reset Filters</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredExercises(activeTab).map(exercise => (
                      <ExerciseCard key={exercise.id} exercise={exercise} />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ExerciseLibrary;
