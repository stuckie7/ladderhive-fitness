
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

/**
 * This component handles various video types and displays them appropriately
 */
const ExerciseVideoHandler = ({
  url,
  title,
  className = "rounded-full bg-white text-black border-0",
  showPlaceholder = true,
  thumbnailUrl
}: {
  url?: string | null;
  title?: string;
  className?: string;
  showPlaceholder?: boolean;
  thumbnailUrl?: string | null;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Handle both url and videoUrl for backward compatibility
  if (!url) {
    return showPlaceholder ? (
      <p className="text-gray-500 italic">No video available</p>
    ) : null;
  }
  
  // Extract YouTube video ID
  const getYouTubeVideoId = (url: string): string | null => {
    try {
      // Match patterns like youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID
      const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:&|$|\/)/);
      return videoIdMatch ? videoIdMatch[1] : null;
    } catch {
      return null;
    }
  };

  const videoId = getYouTubeVideoId(url);
  
  if (!videoId) {
    // Return button that opens URL in new tab if not a YouTube video
    return (
      <Button 
        variant="outline" 
        size="icon" 
        className={className}
        onClick={() => window.open(url, '_blank')}
      >
        <Video className="h-6 w-6" />
      </Button>
    );
  }

  // Return a button that shows YouTube preview on hover
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Button 
        variant="outline" 
        size="icon" 
        className={className}
        onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
      >
        <Video className="h-6 w-6" />
      </Button>
      
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 z-50 shadow-lg rounded-lg overflow-hidden">
          <div className="aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&modestbranding=1`}
              title={title || "Video Preview"}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {title && (
            <div className="bg-white dark:bg-gray-800 p-2 text-sm font-medium truncate">
              {title}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseVideoHandler;
