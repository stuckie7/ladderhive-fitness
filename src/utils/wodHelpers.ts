
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

/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
export const getYouTubeVideoId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  try {
    console.log("Parsing YouTube URL:", url);
    
    // Clean the URL if it has quotes
    const cleanUrl = url.replace(/^["']|["']$/g, '');
    
    // Enhanced regex to handle more YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/, // Standard formats
      /(?:youtube\.com\/v\/|youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/, // Other formats
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/ // YouTube Shorts
    ];
    
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        console.log("Extracted video ID:", match[1]);
        return match[1];
      }
    }
    
    console.log("No video ID found in URL:", cleanUrl);
    return null;
  } catch (error) {
    console.error("Error extracting YouTube video ID:", error);
    return null;
  }
};

/**
 * Gets YouTube thumbnail URL from video URL
 */
export const getYouTubeThumbnail = (url: string | null | undefined): string | null => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) {
    console.log("No video ID found for URL:", url);
    return null;
  }
  
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

/**
 * Convert YouTube URL to embed format
 */
export const getYouTubeEmbedUrl = (url: string | null | undefined): string | null => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  
  return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * Creates a truncated description snippet with ellipsis
 */
export const createDescriptionSnippet = (description: string | undefined, maxLength: number = 50): string => {
  if (!description) return "No description available";
  
  if (description.length <= maxLength) {
    return description;
  }
  
  return `${description.substring(0, maxLength).trim()}...`;
};
