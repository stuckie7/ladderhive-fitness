
import { defaultMuscleGroups, defaultEquipmentTypes } from "@/hooks/exercise-library/constants";
import { exerciseCache } from "../cache/exercise-cache";

export const getMuscleGroups = async (): Promise<string[]> => {
  if (exerciseCache.muscleGroups) {
    return exerciseCache.muscleGroups;
  }
  
  exerciseCache.muscleGroups = defaultMuscleGroups;
  return defaultMuscleGroups;
};

export const getEquipmentTypes = async (): Promise<string[]> => {
  if (exerciseCache.equipmentTypes) {
    return exerciseCache.equipmentTypes;
  }
  
  exerciseCache.equipmentTypes = defaultEquipmentTypes;
  return defaultEquipmentTypes;
};
