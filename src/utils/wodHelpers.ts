
import { WodComponent } from '@/types/wod';

/**
 * Parses the WOD components from database format to proper typing
 */
export const parseWodComponents = (components: any[] | null): WodComponent[] => {
  if (!components || !Array.isArray(components)) {
    return [];
  }

  // Ensure components are properly typed
  return components.map(comp => ({
    order: typeof comp.order === 'number' ? comp.order : parseInt(comp.order, 10) || 0,
    description: comp.description || ''
  }));
};
