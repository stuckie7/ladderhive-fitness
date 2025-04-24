
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Exercise, ExerciseFilters, ExerciseFull } from "@/types/exercise";
import { useExercises } from "./use-exercises";
import { useExercisesFull } from "./use-exercises-full";
import { getBodyParts, getEquipmentList } from "@/integrations/exercisedb/client";

// Default muscle groups and equipment
const defaultMuscleGroups = [
  "Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Full Body", "Cardio"
];

const defaultEquipmentTypes = [
  "Bodyweight", "Dumbbells", "Barbell", "Kettlebell", "Resistance Bands", 
  "Cable Machine", "Smith Machine", "Machine", "Medicine Ball", "Foam Roller"
];

// Helper function to map ExerciseFull to Exercise
const mapExerciseFullToExercise = (exerciseFull: ExerciseFull): Exercise => {
  return {
    id: exerciseFull.id.toString(),
    name: exerciseFull.name || '',
    bodyPart: exerciseFull.body_region || '',
    target: exerciseFull.target_muscle_group || '',
    equipment: exerciseFull.primary_equipment || '',
    gifUrl: exerciseFull.short_youtube_demo || '',
    secondaryMuscles: exerciseFull.secondary_muscle ? [exerciseFull.secondary_muscle] : [],
    instructions: [],
    muscle_group: exerciseFull.target_muscle_group || '',
    description: `${exerciseFull.prime_mover_muscle || ''} - ${exerciseFull.mechanics || ''} - ${exerciseFull.force_type || ''}`,
    difficulty: exerciseFull.difficulty || 'Intermediate',
    video_url: exerciseFull.in_depth_youtube_exp || exerciseFull.short_youtube_demo || '',
    image_url: ''
  };
};

export const useExerciseLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<ExerciseFilters>({
    muscleGroup: "all_muscle_groups",
    equipment: "all_equipment",
    difficulty: "all_difficulties"
  });
  const [availableMuscleGroups, setAvailableMuscleGroups] = useState<string[]>(defaultMuscleGroups);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>(defaultEquipmentTypes);
  
  const { 
    getExercisesByMuscleGroup, 
    getExercisesByEquipment, 
    searchExercises 
  } = useExercises();
  
  const {
    fetchExercisesFull,
    searchExercisesFull,
    getMuscleGroups,
    getEquipmentTypes,
    isLoading: isLoadingFull
  } = useExercisesFull();

  // Fetch available muscle groups and equipment from both API and Supabase
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Get filter options from ExerciseDB API
        const [bodyParts, equipment] = await Promise.all([
          getBodyParts(),
          getEquipmentList()
        ]);
        
        // Get filter options from Supabase exercises_full table
        const [supabaseMuscleGroups, supabaseEquipment] = await Promise.all([
          getMuscleGroups(),
          getEquipmentTypes()
        ]);
        
        // Combine and deduplicate options
        if (bodyParts.length || supabaseMuscleGroups.length) {
          const allMuscleGroups = [
            ...bodyParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)),
            ...supabaseMuscleGroups
          ];
          setAvailableMuscleGroups([...new Set(allMuscleGroups)]);
        }
        
        if (equipment.length || supabaseEquipment.length) {
          const allEquipment = [
            ...equipment.map(eq => eq.charAt(0).toUpperCase() + eq.slice(1)),
            ...supabaseEquipment
          ];
          setAvailableEquipment([...new Set(allEquipment)]);
        }
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };
    
    fetchFilterOptions();
  }, []);

  const fetchExercises = async () => {
    // Try to get exercises from exercises_full first
    try {
      if (searchQuery) {
        const fullExercises = await searchExercisesFull(searchQuery);
        if (fullExercises && fullExercises.length > 0) {
          console.log("Found exercises in exercises_full:", fullExercises.length);
          return fullExercises.map(mapExerciseFullToExercise);
        }
      }
      
      // Apply filters to exercises_full
      if (filters.muscleGroup && filters.muscleGroup !== "all_muscle_groups") {
        const fullExercises = await fetchExercisesFull(20, 0); // Get initial set
        const filtered = fullExercises.filter(ex => 
          ex.target_muscle_group?.toLowerCase() === filters.muscleGroup.toLowerCase() ||
          ex.prime_mover_muscle?.toLowerCase() === filters.muscleGroup.toLowerCase()
        );
        
        if (filtered.length > 0) {
          return filtered.map(mapExerciseFullToExercise);
        }
      }
      
      if (filters.equipment && filters.equipment !== "all_equipment") {
        const fullExercises = await fetchExercisesFull(20, 0); // Get initial set
        const filtered = fullExercises.filter(ex => 
          ex.primary_equipment?.toLowerCase() === filters.equipment.toLowerCase() ||
          ex.secondary_equipment?.toLowerCase() === filters.equipment.toLowerCase()
        );
        
        if (filtered.length > 0) {
          return filtered.map(mapExerciseFullToExercise);
        }
      }
      
      // If no suitable exercises found in exercises_full, fall back to original approach
      if (searchQuery) {
        return await searchExercises(searchQuery);
      }
      
      if (filters.muscleGroup && filters.muscleGroup !== "all_muscle_groups") {
        return await getExercisesByMuscleGroup(filters.muscleGroup.toLowerCase());
      }
      
      if (filters.equipment && filters.equipment !== "all_equipment") {
        return await getExercisesByEquipment(filters.equipment.toLowerCase());
      }
      
      // Default: fetch exercises for the first muscle group
      const firstBodyPart = availableMuscleGroups[0]?.toLowerCase() || 'back';
      const exercises = await getExercisesByMuscleGroup(firstBodyPart);
      
      let filteredData = exercises;
      
      // Apply client-side filtering for difficulty if set
      if (filters.difficulty && filters.difficulty !== "all_difficulties") {
        filteredData = filteredData.filter(ex => 
          ex.difficulty === filters.difficulty
        );
      }
      
      return filteredData;
    } catch (error) {
      console.error("Error fetching exercises:", error);
      
      // Ultimate fallback to original approach
      if (searchQuery) {
        return await searchExercises(searchQuery);
      }
      
      const firstBodyPart = availableMuscleGroups[0]?.toLowerCase() || 'back';
      return await getExercisesByMuscleGroup(firstBodyPart);
    }
  };

  const { data: exercises, isLoading: isLoadingQuery, refetch } = useQuery({
    queryKey: ['exercises', filters, searchQuery, availableMuscleGroups[0]],
    queryFn: fetchExercises,
    enabled: availableMuscleGroups.length > 0
  });

  const isLoading = isLoadingQuery || isLoadingFull;

  const resetFilters = () => {
    setFilters({
      muscleGroup: "all_muscle_groups",
      equipment: "all_equipment",
      difficulty: "all_difficulties"
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
      ex.bodyPart?.toLowerCase() === muscleGroup.toLowerCase() ||
      ex.target?.toLowerCase() === muscleGroup.toLowerCase()
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    refetch();
  }, [filters, searchQuery, refetch]);

  return {
    exercises,
    isLoading,
    searchQuery,
    activeTab,
    filters,
    availableMuscleGroups,
    availableEquipment,
    setSearchQuery,
    setActiveTab,
    setFilters,
    resetFilters,
    getFilteredExercises,
    handleSearchChange,
    refetch
  };
};
