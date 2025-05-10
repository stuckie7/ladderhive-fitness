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
      try {
        const parsed = JSON.parse(componentsData);
        if (Array.isArray(parsed)) {
          return parsed.map((component, index) => ({
            order: component.order || index + 1,
            description: component.description || 'No description'
          }));
        }
      } catch (e) {
        // If JSON parsing fails, treat as a single component
        return [{
          order: 1,
          description: componentsData
        }];
      }
    }
    
    // If it's an object but not an array (generic JSON type)
    if (componentsData && typeof componentsData === 'object') {
      // Try to convert it to array if possible
      const values = Object.values(componentsData);
      if (values.length > 0) {
        return values.map((component: any, index) => {
          // If component is a string, create a simple component
          if (typeof component === 'string') {
            return {
              order: index + 1,
              description: component
            };
          }
          
          // Otherwise, use component object structure
          return {
            order: component.order || index + 1,
            description: component.description || 'No description'
          };
        });
      }
    }
    
    // Fallback if we can't parse it properly
    return [];
    
  } catch (error) {
    console.error("Error parsing WOD components:", error);
    return [];
  }
};
