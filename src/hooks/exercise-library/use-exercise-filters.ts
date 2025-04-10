
import { useState, useEffect } from "react";
import { ExerciseFilters } from "@/types/exercise";
import { defaultMuscleGroups, defaultEquipmentTypes } from "./constants";
import { getBodyParts, getEquipmentList } from "@/integrations/exercisedb/client";

export const useExerciseFilters = (
  getMuscleGroups: () => Promise<string[]>,
  getEquipmentTypes: () => Promise<string[]>,
) => {
  const [filters, setFilters] = useState<ExerciseFilters>({
    muscleGroup: "all_muscle_groups",
    equipment: "all_equipment",
    difficulty: "all_difficulties"
  });
  
  const [availableMuscleGroups, setAvailableMuscleGroups] = useState<string[]>(defaultMuscleGroups);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>(defaultEquipmentTypes);

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
  }, [getMuscleGroups, getEquipmentTypes]);

  const resetFilters = () => {
    setFilters({
      muscleGroup: "all_muscle_groups",
      equipment: "all_equipment",
      difficulty: "all_difficulties"
    });
  };

  return {
    filters,
    setFilters,
    resetFilters,
    availableMuscleGroups,
    availableEquipment
  };
};
