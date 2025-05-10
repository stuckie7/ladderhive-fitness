
import { WodComponent } from '@/types/wod';

/**
 * Safely parses WOD components from various formats
 * Handles both string JSON and actual JSON objects
 */
export const parseWodComponents = (componentsData: any): WodComponent[] => {
  try {
    // If it's already an array, just make sure each item has the required structure
    if (Array.isArray(componentsData)) {
      return componentsData.map((component, index) => ({
        order: component.order || index + 1,
        description: component.description || 'No description'
      }));
    }
    
    // If it's a string, try to parse it
    if (typeof componentsData === 'string') {
      const parsed = JSON.parse(componentsData);
      if (Array.isArray(parsed)) {
        return parsed.map((component, index) => ({
          order: component.order || index + 1,
          description: component.description || 'No description'
        }));
      }
    }
    
    // If it's an object but not an array (generic JSON type)
    if (componentsData && typeof componentsData === 'object') {
      // Try to convert it to array if possible
      const values = Object.values(componentsData);
      if (Array.isArray(values)) {
        return values.map((component: any, index) => ({
          order: component.order || index + 1,
          description: component.description || 'No description'
        }));
      }
    }
    
    // Fallback if we can't parse it properly
    return [];
    
  } catch (error) {
    console.error("Error parsing WOD components:", error);
    return [];
  }
};
