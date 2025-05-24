
import { Wod, WodComponent, SimpleWodComponent } from '@/types/wod';

// Function to extract YouTube video ID from various YouTube URL formats
export function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  
  // Regular expression to match various YouTube URL formats
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[7].length === 11) ? match[7] : null;
}

// Parse WOD components based on type
export function parseWodComponents(components: any): WodComponent[] {
  if (!components) return [];
  
  // If it's already an array of objects with required fields
  if (Array.isArray(components) && components.length > 0 && 'id' in components[0]) {
    return components as WodComponent[];
  }
  
  // If it's a string, try to parse it as JSON
  if (typeof components === 'string') {
    try {
      const parsedComponents = JSON.parse(components);
      if (Array.isArray(parsedComponents)) {
        return parsedComponents.map((component, index) => {
          return {
            id: `component-${index}`,
            wod_id: 'generated',
            type: 'standard',
            description: component.description || '',
            order: component.order || index,
          };
        });
      }
    } catch (e) {
      console.error('Error parsing WOD components:', e);
    }
  }
  
  // If it's an array of simple objects with just order and description
  if (Array.isArray(components)) {
    return components.map((component, index) => {
      return {
        id: `component-${index}`,
        wod_id: 'generated',
        type: 'standard',
        description: component.description || '',
        order: component.order || index,
      };
    });
  }
  
  return [];
}

// Function to get YouTube embed URL
export function getYouTubeEmbedUrl(url?: string): string | null {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

// Function to get YouTube thumbnail URL
export function getYouTubeThumbnail(url?: string): string | null {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
}

// Function to create a snippet from a description
export function createDescriptionSnippet(description: string, maxLength: number = 100): string {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  
  return `${description.substring(0, maxLength).trim()}...`;
}

// Function to generate an engaging description when none is provided
export function generateEngagingDescription(wod: Wod): string {
  const difficultyText = wod.difficulty ? `${wod.difficulty} level` : '';
  const categoryText = wod.category ? `${wod.category} workout` : 'workout';
  
  return `A ${difficultyText} ${categoryText} designed to challenge and improve your fitness.`;
}

// Function to standardize workout data from different sources
export function standardizeWodData(wod: any): Wod {
  return {
    id: wod.id,
    title: wod.title || wod.name || 'Unnamed Workout',
    name: wod.name || wod.title || 'Unnamed Workout',
    description: wod.description || '',
    category: wod.category || 'General',
    difficulty: wod.difficulty || 'Intermediate',
    duration_minutes: wod.duration_minutes || wod.avg_duration_minutes || 30,
    avg_duration_minutes: wod.avg_duration_minutes || wod.duration_minutes || 30,
    created_at: wod.created_at || new Date().toISOString(),
    equipment_needed: wod.equipment_needed || [],
    is_featured: wod.is_featured || false,
    is_favorite: wod.is_favorite || false,
    is_new: wod.is_new || false,
    components: wod.components ? parseWodComponents(wod.components) : [],
    video_url: wod.video_url || wod.video_demo || null,
    video_demo: wod.video_demo || wod.video_url || null,
    image_url: wod.image_url || null,
    // Include part fields
    part_1: wod.part_1 || null,
    part_2: wod.part_2 || null,
    part_3: wod.part_3 || null,
    part_4: wod.part_4 || null,
    part_5: wod.part_5 || null,
    part_6: wod.part_6 || null,
    part_7: wod.part_7 || null,
    part_8: wod.part_8 || null,
    part_9: wod.part_9 || null,
    part_10: wod.part_10 || null
  };
}
