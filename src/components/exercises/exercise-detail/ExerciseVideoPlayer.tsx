
import { PlayCircle } from "lucide-react";

interface ExerciseVideoPlayerProps {
  url: string | null;
  title: string;
}

export default function ExerciseVideoPlayer({ url, title }: ExerciseVideoPlayerProps) {
  if (!url) return null;
  
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
        <PlayCircle className="h-5 w-5 mr-2 text-red-600" />
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
