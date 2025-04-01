
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/layout/AppLayout";
import ExerciseFilters from "@/components/exercises/ExerciseFilters";
import ExerciseCard from "@/components/exercises/ExerciseCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: string | null;
  instructions: string | null;
  video_url: string | null;
  image_url: string | null;
}

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
  const [filters, setFilters] = useState({
    muscleGroup: "",
    equipment: "",
    difficulty: ""
  });

  // Fetch exercises from the database
  const fetchExercises = async () => {
    let query = supabase.from("exercises").select("*");

    // Apply filters
    if (filters.muscleGroup) {
      query = query.eq("muscle_group", filters.muscleGroup);
    }
    if (filters.equipment) {
      query = query.eq("equipment", filters.equipment);
    }
    if (filters.difficulty) {
      query = query.eq("difficulty", filters.difficulty);
    }
    if (searchQuery) {
      query = query.ilike("name", `%${searchQuery}%`);
    }

    // Order by name
    query = query.order("name");

    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data as Exercise[];
  };

  const { data: exercises, isLoading, refetch } = useQuery({
    queryKey: ['exercises', filters, searchQuery],
    queryFn: fetchExercises
  });

  // Reset filters
  const resetFilters = () => {
    setFilters({
      muscleGroup: "",
      equipment: "",
      difficulty: ""
    });
    setSearchQuery("");
  };

  // Filter by muscle group (for tabs)
  const getFilteredExercises = (muscleGroup: string) => {
    if (!exercises) return [];
    
    if (muscleGroup === "all") {
      return exercises;
    }
    
    return exercises.filter(ex => ex.muscle_group === muscleGroup);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    refetch();
  }, [filters, searchQuery, refetch]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Exercise Library</h1>
        
        {/* Search Bar */}
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
        
        {/* Filters */}
        <ExerciseFilters 
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
          muscleGroups={muscleGroups}
          equipmentTypes={equipmentTypes}
          difficultyLevels={difficultyLevels}
        />
        
        {/* Tabs for quick muscle group filtering */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="flex overflow-x-auto pb-2 mb-4 w-full">
            <TabsTrigger value="all" className="flex-shrink-0">All Exercises</TabsTrigger>
            {muscleGroups.map(group => (
              <TabsTrigger key={group} value={group} className="flex-shrink-0">
                {group}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Tab content */}
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
