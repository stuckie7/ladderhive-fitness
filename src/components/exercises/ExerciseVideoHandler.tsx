
import { Info, PlayCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExerciseVideoHandlerProps {
  url: string | null | undefined;
  title: string;
  className?: string;
  showPlaceholder?: boolean;
}

/**
 * A component for handling exercise video links that might be:
 * 1. Actual URL links to videos
 * 2. Text descriptions like "Video Demonstration" 
 * 3. Null/undefined values
 */
export default function ExerciseVideoHandler({ 
  url, 
  title, 
  className = "",
  showPlaceholder = true
}: ExerciseVideoHandlerProps) {
  // If no video data provided at all
  if (!url) {
    if (!showPlaceholder) return null;
    
    return (
      <div className={`text-muted-foreground text-sm ${className}`}>
        No video available
      </div>
    );
  }
  
  // Helper function to check if it's a valid URL
  const isValidUrl = (str: string): boolean => {
    // Basic URL validation - check if it contains youtube domains or starts with http/https
    return (
      str.includes("youtube.com") || 
      str.includes("youtu.be") || 
      str.startsWith("http://") || 
      str.startsWith("https://")
    );
  };
  
  // If it's just text and not a URL (like "Video Demonstration"), show info button
  if (!isValidUrl(url)) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Info className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground text-sm">{url}</span>
      </div>
    );
  }
  
  // It's a valid URL, show as a button
  return (
    <Button
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 ${className}`}
      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
    >
      <PlayCircle className="h-4 w-4 text-red-600" />
      <span>{title}</span>
    </Button>
  );
}
