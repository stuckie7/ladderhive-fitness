
import React, { useState } from 'react';
import { Youtube, Play } from 'lucide-react';
import { Exercise } from '@/types/exercise';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface ExerciseVideoHandlerProps {
  exercise?: Exercise;
  title?: string;
  className?: string;
  showPlaceholder?: boolean;
  url?: string;  // Added direct URL property for flexibility
}

const ExerciseVideoHandler: React.FC<ExerciseVideoHandlerProps> = ({ 
  exercise, 
  title,
  className = '',
  showPlaceholder = true,
  url
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get the video URL from either the direct url prop or from the exercise object
  const getVideoUrl = (): string => {
    if (url) return url;
    
    if (exercise) {
      return exercise.short_youtube_demo || 
             exercise.video_explanation_url || 
             exercise.video_demonstration_url ||
             exercise.video_url || 
             '';
    }
    
    return '';
  };

  const videoUrl = getVideoUrl();
  
  // Return null if no video URL is available
  if (!videoUrl) return null;
  
  const displayTitle = title || (exercise ? exercise.name : 'Exercise Demo');

  const getEmbedUrl = (url: string): string => {
    // Convert YouTube URLs to embed URLs
    if (url.includes('youtube.com/watch')) {
      return url.replace('watch?v=', 'embed/');
    } 
    // Handle YouTube shortened URLs
    else if (url.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${url.split('/').pop()}`;
    }
    return url; // Return as is if not matching any pattern
  };
  
  const embedUrl = getEmbedUrl(videoUrl);
  
  return (
    <div className={`mt-2 ${className}`}>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center" 
        onClick={() => setIsOpen(true)}
      >
        {showPlaceholder ? (
          <>
            <Youtube className="h-4 w-4 mr-2" />
            <span>Watch Demo</span>
          </>
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{displayTitle}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full pt-[56.25%]">
            <iframe 
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl}
              title={displayTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseVideoHandler;
