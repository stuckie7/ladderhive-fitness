
import React from 'react';
import { Exercise } from '@/types/exercise';

interface ExerciseVideoHandlerProps {
  exercise: Exercise;
  title: string;
  className?: string;
  showPlaceholder?: boolean;
  url?: string;
  thumbnailUrl?: string;
}

const ExerciseVideoHandler: React.FC<ExerciseVideoHandlerProps> = ({ 
  exercise, 
  title, 
  className,
  showPlaceholder = true,
  url: externalUrl,
  thumbnailUrl
}) => {
  // Early return if exercise is undefined or has no video URLs
  if (!exercise && !externalUrl) {
    return showPlaceholder ? (
      <div className={`flex items-center justify-center text-muted-foreground p-4 ${className || ''}`}>
        <p>No video available</p>
      </div>
    ) : null;
  }

  // Try different video URL fields in order of preference
  const videoUrls = [
    externalUrl || '',
    exercise?.in_depth_youtube_exp || '',
    exercise?.short_youtube_demo || '',
    exercise?.video_explanation_url || '',
    exercise?.video_demonstration_url || '',
    exercise?.video_url || ''
  ].filter(url => url && url.trim());

  const url = videoUrls[0] || null;

  if (!url) {
    return showPlaceholder ? (
      <div className={`flex items-center justify-center text-muted-foreground p-4 ${className || ''}`}>
        <p>No video available</p>
      </div>
    ) : null;
  }

  const isYoutubeVideo = url.includes('youtube.com') || url.includes('youtu.be');
  
  const getEmbedUrl = (videoUrl: string): string => {
    try {
      console.log('Processing video URL:', videoUrl);
      
      // For youtube videos
      if (isYoutubeVideo) {
        let videoId;
        if (videoUrl.includes('youtube.com/watch?v=')) {
          videoId = new URL(videoUrl).searchParams.get('v');
        } else if (videoUrl.includes('youtu.be/')) {
          videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        }
        
        if (videoId) {
          console.log('Extracted video ID:', videoId);
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      // For direct YouTube embed URLs
      if (videoUrl.includes('youtube.com/embed/')) {
        console.log('Video URL already in embed format');
        return videoUrl;
      }
      
      // For other video formats
      console.log('Using original video URL');
      return videoUrl;
    } catch (error) {
      console.error('Error processing video URL:', error);
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
