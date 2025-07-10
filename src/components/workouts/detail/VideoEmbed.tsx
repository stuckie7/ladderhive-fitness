
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Video } from "lucide-react";

interface VideoEmbedProps {
  videoUrl?: string;
  className?: string;
}

const VideoEmbed: React.FC<VideoEmbedProps> = ({ videoUrl, className = '' }) => {
  const [error, setError] = useState(false);

  if (!videoUrl || error) {
    return (
      <Card className="mb-6 aspect-video">
        <CardContent className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
          <div className="text-center">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Video not available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getYouTubeEmbedUrl = (url: string): string => {
    // Extract video ID from various YouTube URL formats
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  };

  return (
    <div className={`${className} aspect-video`}>
      <iframe
        className="w-full h-full rounded-lg"
        src={getYouTubeEmbedUrl(videoUrl)}
        title="Workout Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onError={() => setError(true)}
      ></iframe>
    </div>
  );
};

export default VideoEmbed;
