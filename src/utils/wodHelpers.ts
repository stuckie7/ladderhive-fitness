
import { WodComponent } from '@/types/wod';
import { Json } from '@/integrations/supabase/types';

export function parseWodComponents(components: Json | null): WodComponent[] {
  if (!components) return [];
  
  try {
    // If it's already an array, process it
    if (Array.isArray(components)) {
      return components.map((item, index) => {
        // Handle both objects with order/description properties and simple strings
        if (typeof item === 'object' && item !== null) {
          return {
            order: (item as any).order || index + 1,
            description: (item as any).description || String(item)
          };
        }
        // Handle primitive values
        return {
          order: index + 1,
          description: String(item)
        };
      });
    }
    
    // If it's a JSON string that needs parsing
    if (typeof components === 'string') {
      try {
        const parsed = JSON.parse(components);
        return Array.isArray(parsed) 
          ? parseWodComponents(parsed)
          : [];
      } catch {
        return [];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing WOD components:', error);
    return [];
  }
}
