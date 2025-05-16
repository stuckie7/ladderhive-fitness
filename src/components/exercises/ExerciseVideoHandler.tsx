
import React from 'react';

interface ExerciseVideoHandlerProps {
  url: string | null;
  title: string;
  className?: string;
  thumbnailUrl?: string | null;
  showPlaceholder?: boolean;
}

const ExerciseVideoHandler: React.FC<ExerciseVideoHandlerProps> = ({ 
  url, 
  title, 
  className,
  thumbnailUrl,
  showPlaceholder = true
}) => {
  if (!url) {
    return showPlaceholder ? (
      <div className={`flex items-center justify-center text-muted-foreground p-4 ${className || ''}`}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="max-w-full h-auto rounded" />
        ) : (
          "No video available"
        )}
      </div>
    ) : null;
  }

  const isYoutubeVideo = url.includes('youtube.com') || url.includes('youtu.be');
  
  const getEmbedUrl = (videoUrl: string): string => {
    try {
      // For youtube videos
      if (isYoutubeVideo) {
        let videoId;
        if (videoUrl.includes('youtube.com/watch?v=')) {
          videoId = new URL(videoUrl).searchParams.get('v');
        } else if (videoUrl.includes('youtu.be/')) {
          videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        }
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      return videoUrl;
    } catch {
      return videoUrl;
    }
  };

  if (isYoutubeVideo) {
    const embedUrl = getEmbedUrl(url);
    return (
      <div className={`aspect-video bg-muted rounded-lg overflow-hidden ${className || ''}`}>
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  // For non-youtube videos or direct video URLs
  return (
    <div className={`aspect-video bg-muted rounded-lg overflow-hidden ${className || ''}`}>
      <video 
        src={url} 
        controls 
        title={title}
        className="w-full h-full"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default ExerciseVideoHandler;
