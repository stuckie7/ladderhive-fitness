import React from 'react';
import { Exercise, ExerciseFull } from './exercise'; // Adjust path as needed

interface ExerciseVideoHandlerProps {
  /** The exercise object containing video links */
  exercise: Exercise | ExerciseFull;
  /** Which video field to use (demo or explanation) */
  type: 'demo' | 'explanation';
  /** Optional CSS class for styling */
  className?: string;
  /** Custom text to display when video is not available */
  emptyMessage?: string;
  /** Optional additional props for the link element */
  linkProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
}

/**
 * ExerciseVideoHandler Component
 * 
 * Specialized component for handling exercise video links that may contain
 * "Video Demonstration" text or actual URLs. Prevents 404 errors when
 * non-URL values are clicked.
 */
const ExerciseVideoHandler: React.FC<ExerciseVideoHandlerProps> = ({
  exercise,
  type,
  className = "",
  emptyMessage = "No video available",
  linkProps = {}
}) => {
  // Determine which video URL to use based on the type prop
  const getVideoUrl = (): string | null => {
    if (type === 'demo') {
      // Check all possible fields for demo videos in order of preference
      return exercise.short_youtube_demo || 
             exercise.video_demonstration_url || 
             exercise.video_url || 
             null;
    } else {
      // For explanation videos
      return exercise.in_depth_youtube_exp || 
             exercise.video_explanation_url || 
             null;
    }
  };

  // Get the link text to display
  const getLinkText = (): string => {
    return type === 'demo' 
      ? (linkProps.children as string || "Watch Demo") 
      : (linkProps.children as string || "Watch Explanation");
  };

  const videoUrl = getVideoUrl();

  // Handle null, undefined or empty string cases
  if (!videoUrl) {
    return <span className={className}>{emptyMessage}</span>;
  }

  // Special case for "Video Demonstration" text
  if (videoUrl === "Video Demonstration") {
    return <span className={className}>Video Demonstration</span>;
  }

  // Check if the link is a valid URL
  try {
    // This will throw an error if the string is not a valid URL
    new URL(videoUrl);
    
    // If it's a valid URL, render as a link
    return (
      <a 
        href={videoUrl} 
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        {...linkProps}
      >
        {getLinkText()}
      </a>
    );
  } catch (error) {
    // If not a valid URL, just render as text
    return <span className={className}>{videoUrl}</span>;
  }
};

export default ExerciseVideoHandler;
