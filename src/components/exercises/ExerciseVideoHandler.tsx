import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExerciseVideoHandlerProps {
  url?: string | null;
  title?: string;
  className?: string;
  showPlaceholder?: boolean;
}

const ExerciseVideoHandler: React.FC<ExerciseVideoHandlerProps> = ({
  url,
  title = "Watch Video",
  className = "",
  showPlaceholder = true,
}) => {
  // If no URL is provided and we don't want to show a placeholder, return null
  if (!url && !showPlaceholder) {
    return null;
  }

  // If no URL is provided but we want to show a placeholder
  if (!url) {
    return (
      <div className={`text-muted-foreground text-sm ${className}`}>
        No video available
      </div>
    );
  }

  // Check if the URL is actually "Video Demonstration" or similar text
  if (
    url === "Video Demonstration" ||
    url.includes("Video Demonstration") ||
    !url.includes("://")
  ) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="outline"
              size="sm"
              className={`gap-1 ${className}`}
              onClick={(e) => e.preventDefault()}
            >
              <Info className="h-4 w-4" />
              <span>Video Info</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{url}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Otherwise, it's a valid URL
  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-1 ${className}`}
      onClick={() => window.open(url, "_blank")}
    >
      <Play className="h-4 w-4" />
      <span>{title}</span>
    </Button>
  );
};

export default ExerciseVideoHandler;
