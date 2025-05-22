
const getYouTubeThumbnail = (url: string | null): string | null => {
  if (!url) return null;

  try {
    const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
};

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string | null): string | null => {
  if (!url) return null;
  
  try {
    // Match patterns like youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID
    const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:&|$|\/)/);
    return videoIdMatch ? videoIdMatch[1] : null;
  } catch {
    return null;
  }
};

import { useState } from "react";
import { ExerciseFull } from "@/types/exercise";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Info, Video, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddToWorkoutButton from "./AddToWorkoutButton";

interface ExerciseCardFullProps {
  exercise: ExerciseFull;
  onEdit?: (exercise: ExerciseFull) => void;
  onDelete?: (exercise: ExerciseFull) => void;
}

const ExerciseCardFull = ({ exercise, onEdit, onDelete }: ExerciseCardFullProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const videoId = getYouTubeVideoId(exercise.short_youtube_demo);
  
  // Helper function to determine difficulty badge class
  const getDifficultyBadgeClass = (difficulty: string | null) => {
    if (!difficulty) return "bg-gray-100 text-gray-800";
    
    switch(difficulty.toLowerCase()) {
      case 'beginner':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'intermediate':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 'advanced':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Handle navigation to exercise detail page
  const handleViewDetails = () => {
    navigate(`/exercises/enhanced/${exercise.id}`);
  };

  // Get thumbnail from video URL
  const thumbnailUrl = exercise.video_demonstration_url ? 
    getYouTubeThumbnail(exercise.video_demonstration_url) : 
    getYouTubeThumbnail(exercise.short_youtube_demo);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg line-clamp-1">{exercise.name}</CardTitle>
          <div className="flex gap-1">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => onEdit(exercise)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-500 hover:text-red-600" 
                onClick={() => onDelete(exercise)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {exercise.prime_mover_muscle && (
              <Badge variant="outline" className="bg-muted/50">
                {exercise.prime_mover_muscle}
              </Badge>
            )}
            {exercise.primary_equipment && (
              <Badge variant="outline" className="bg-muted/50">
                {exercise.primary_equipment}
              </Badge>
            )}
            {exercise.difficulty && (
              <Badge className={getDifficultyBadgeClass(exercise.difficulty)}>
                {exercise.difficulty}
              </Badge>
            )}
          </div>
          
          <div 
            className="aspect-video bg-muted rounded-md relative overflow-hidden" 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {videoId && isHovered ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${videoId}`}
                title={exercise.name || "Exercise Video"}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                {exercise.short_youtube_demo || thumbnailUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={thumbnailUrl || `https://img.youtube.com/vi/${getYouTubeVideoId(exercise.short_youtube_demo)}/hqdefault.jpg`}
                      alt="Exercise Thumbnail"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full bg-white/80 text-black border-0 hover:bg-white"
                        onClick={() => window.open(exercise.short_youtube_demo!, '_blank')}
                      >
                        <Video className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Dumbbell className="h-8 w-8 opacity-30" />
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="text-sm">
            {exercise.prime_mover_muscle && (
              <p><span className="font-medium">Primary Muscle:</span> {exercise.prime_mover_muscle}</p>
            )}
            {exercise.mechanics && (
              <p><span className="font-medium">Mechanics:</span> {exercise.mechanics}</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex w-full gap-2">
          <Button variant="default" className="flex-1" onClick={handleViewDetails}>
            <Info className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <AddToWorkoutButton variant="outline" exercise={exercise as any} className="flex-1" />
        </div>
      </CardFooter>
    </Card>
  );
}

export default ExerciseCardFull;
