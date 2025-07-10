
import workoutCategories from '@/components/workouts/categories.json';
import testCategories from '@/components/workouts/test-categories.json';
import testEquipment from '@/components/workouts/test-equipment.json';
import testMuscles from '@/components/workouts/test-muscles.json';
import testExerciseImages from '@/components/workouts/test-exercise-images.json';
import testExerciseVideos from '@/components/workouts/test-exercise-videos.json';

/**
 * Utility functions for loading data from local JSON files
 */

export const loadLocalWorkoutCategories = () => {
  return workoutCategories;
};

export const loadLocalTestCategories = () => {
  return testCategories;
};

export const loadLocalTestEquipment = () => {
  return testEquipment;
};

export const loadLocalTestMuscles = () => {
  return testMuscles;
};

export const loadLocalTestExerciseImages = () => {
  return testExerciseImages;
};

export const loadLocalTestExerciseVideos = () => {
  return testExerciseVideos;
};

/**
 * Parses a CSV file content into an array of objects
 * 
 * @param csvContent - The CSV content as a string
 * @returns An array of objects representing the CSV data
 */
export const parseCsvData = <T>(csvContent: string): T[] => {
  const rows = csvContent.split('\n');
  const headers = rows[0].split(',').map(header => header.trim());
  
  const result = rows.slice(1).map(row => {
    if (!row.trim()) return null; // Skip empty rows
    
    const values = row.split(',').map(value => value.trim());
    const obj: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    return obj as unknown as T;
  }).filter(Boolean) as T[];
  
  return result;
};
