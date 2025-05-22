
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
 * Creates an engaging and attractive workout description snippet
 */
export const createDescriptionSnippet = (description: string | undefined, maxLength: number = 120): string => {
  if (!description) return '🔥 Challenge yourself with this intense workout! 💪';
  
  // Clean up the description
  let cleanDescription = description
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If the description is already short enough, return it as is
  if (cleanDescription.length <= maxLength) return cleanDescription;
  
  // Common patterns to find complete sentences
  const sentenceEnders = ['. ', '! ', '? ', '; ', '\n', '\r\n'];
  
  // Find the last sentence ender within the max length
  let lastGoodIndex = maxLength;
  for (const ender of sentenceEnders) {
    const index = cleanDescription.lastIndexOf(ender, maxLength);
    if (index > 0 && index < maxLength + 20) { // Allow some leeway
      lastGoodIndex = index + ender.length;
      break;
    }
  }
  
  // If we found a good breaking point, use it
  if (lastGoodIndex > maxLength / 2) {
    return cleanDescription.substring(0, lastGoodIndex).trim() + '..';
  }
  
  // Otherwise, just truncate at maxLength and add ellipsis
  return cleanDescription.substring(0, maxLength).trim() + '...';
};

/**
 * Generates an engaging workout description based on WOD details
 */
export const generateEngagingDescription = (wod: any): string => {
  const { 
    name, 
    difficulty, 
    avg_duration_minutes, 
    category,
    description
  } = wod;
  
  // If there's already a good description, enhance it
  if (description && description.trim().length > 0) {
    return description;
  }
  
  // Generate a description based on WOD properties
  const difficultyAdjectives = {
    beginner: ['Perfect for beginners', 'Great for starters', 'Ideal for newcomers'],
    intermediate: ['Challenging', 'Intense', 'Powerful'],
    advanced: ['Brutal', 'Extreme', 'High-intensity'],
    elite: ['Elite-level', 'Pro-level', 'Championship-worthy']
  };
  
  const categoryTitles = {
    girl: ['Girl WOD', 'Classic Benchmark', 'Legendary Challenge'],
    hero: ['Hero WOD', 'Tribute Workout', 'Memorial Challenge'],
    benchmark: ['Benchmark Workout', 'Standard Challenge', 'Fitness Test'],
    default: ['Custom Workout', 'Special Challenge', 'Unique Routine']
  };
  
  const timeFrames = {
    short: ['Quick blast', 'Fast-paced session', 'Rapid workout'],
    medium: ['Solid workout', 'Complete session', 'Full routine'],
    long: ['Endurance challenge', 'Marathon session', 'Ultimate test']
  };
  
  // Determine time frame
  let timeFrame = 'medium';
  if (avg_duration_minutes) {
    if (avg_duration_minutes < 10) timeFrame = 'short';
    else if (avg_duration_minutes > 20) timeFrame = 'long';
  }
  
  // Get random elements
  const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  
  // Build description parts
  const parts = [];
  
  // Add category title if available
  if (category) {
    const categoryTitle = categoryTitles[category.toLowerCase() as keyof typeof categoryTitles] || categoryTitles.default;
    parts.push(getRandom(categoryTitle));
  }
  
  // Add difficulty level
  if (difficulty) {
    const difficultyKey = difficulty.toLowerCase() as keyof typeof difficultyAdjectives;
    if (difficultyAdjectives[difficultyKey]) {
      parts.push(getRandom(difficultyAdjectives[difficultyKey]));
    }
  }
  
  // Add time frame
  parts.push(getRandom(timeFrames[timeFrame as keyof typeof timeFrames]));
  
  // Add some action verbs
  const actions = ['designed to push your limits', 'to boost your fitness', 'for maximum gains', 'to test your mettle'];
  parts.push(getRandom(actions));
  
  // Add emojis
  const emojis = ['💪', '🔥', '⚡', '🏋️', '🚀', '🏆', '💯'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  
  return `${parts.join(' ')} ${randomEmoji}`;
};
