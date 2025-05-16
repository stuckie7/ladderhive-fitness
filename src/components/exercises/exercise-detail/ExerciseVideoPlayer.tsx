
import { Info, Play, Video } from "lucide-react";

interface ExerciseVideoPlayerProps {
  url: string | null;
  title: string;
  thumbnailUrl?: string;
}

export default function ExerciseVideoPlayer({ url, title, thumbnailUrl }: ExerciseVideoPlayerProps) {
  if (!url) {
    return (
      <div className="rounded-lg bg-muted aspect-video flex items-center justify-center">
        <div className="text-center p-6">
          <Video className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground font-medium">No video available</p>
        </div>
      </div>
    );
  }
  
  // Check if the URL is actually a text description like "Video Demonstration" 
  const isValidUrl = (str: string): boolean => {
    // Basic URL validation - check if it contains youtube domains or starts with http/https
    return (
      str.includes("youtube.com") || 
      str.includes("youtu.be") || 
      str.startsWith("http://") || 
      str.startsWith("https://")
    );
  };
  
  // If it's just text and not a URL, show a placeholder message
  if (!isValidUrl(url)) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <Play className="h-5 w-5 mr-2 text-red-600" />
          {title}
        </h3>
        <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
          <div className="text-center p-6">
            <Info className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">{url}</p>
            <p className="text-sm text-muted-foreground mt-2">No valid video URL available</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Convert YouTube URL to embedded format
  const getEmbeddedYoutubeUrl = (url: string): string => {
    if (!url) return '';
    
    // Remove quotes if they exist in the URL (common issue from CSV imports)
    let cleanUrl = url.replace(/^["']|["']$/g, '');
    
    // Handle youtube.com/watch?v= format
    if (cleanUrl.includes('watch?v=')) {
      return cleanUrl.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/, 'https://www.youtube.com/embed/$1');
    }
    
    // Handle youtu.be/ format
    if (cleanUrl.includes('youtu.be/')) {
      return cleanUrl.replace(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/(.+)/, 'https://www.youtube.com/embed/$1');
    }
    
    // If it's already in the embed format or can't be parsed, return as is
    return cleanUrl;
  };
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <Play className="h-5 w-5 mr-2 text-red-600" />
        {title}
      </h3>
      <div className="aspect-video rounded-md overflow-hidden">
        <iframe 
          className="w-full h-full"
          src={getEmbeddedYoutubeUrl(url)}
          title={title}
          allowFullScreen
        />
      </div>
    </div>
  );
}
