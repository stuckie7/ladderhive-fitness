
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
    
    // Handle youtube.com/watch?v= format
    if (url.includes('watch?v=')) {
      return url.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/, 'https://www.youtube.com/embed/$1');
    }
    
    // Handle youtu.be/ format
    if (url.includes('youtu.be/')) {
      return url.replace(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/(.+)/, 'https://www.youtube.com/embed/$1');
    }
    
    // If it's already in the embed format or can't be parsed, return as is
    return url;
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
