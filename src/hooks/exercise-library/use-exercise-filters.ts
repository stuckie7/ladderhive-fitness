
import { useState, useCallback, useEffect } from "react";

// Default muscle groups and equipment
const defaultMuscleGroups = [
  "Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Full Body", "Cardio"
];

const defaultEquipmentTypes = [
  "Bodyweight", "Dumbbells", "Barbell", "Kettlebell", "Resistance Bands", 
  "Cable Machine", "Smith Machine", "Machine", "Medicine Ball", "Foam Roller"
];

export const useExerciseFilters = (
  getMuscleGroupsFn: () => Promise<string[]>,
  getEquipmentTypesFn: () => Promise<string[]>
) => {
  const [filters, setFilters] = useState({
    muscleGroup: "all_muscle_groups",
    equipment: "all_equipment",
    difficulty: "all_difficulties"
  });
  
  const [availableMuscleGroups, setAvailableMuscleGroups] = useState<string[]>(defaultMuscleGroups);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>(defaultEquipmentTypes);

  const resetFilters = useCallback(() => {
    setFilters({
      muscleGroup: "all_muscle_groups",
      equipment: "all_equipment",
      difficulty: "all_difficulties"
    });
  }, []);

  // Fetch available filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Get filter options from Supabase exercises_full table
        const [muscleGroups, equipmentTypes] = await Promise.all([
          getMuscleGroupsFn(),
          getEquipmentTypesFn()
        ]);
        
        if (muscleGroups.length) {
          setAvailableMuscleGroups(muscleGroups);
        }
        
        if (equipmentTypes.length) {
          setAvailableEquipment(equipmentTypes);
        }
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };
    
    fetchFilterOptions();
  }, [getMuscleGroupsFn, getEquipmentTypesFn]);

  return {
    filters,
    setFilters,
    resetFilters,
    availableMuscleGroups,
    availableEquipment
  };
};
