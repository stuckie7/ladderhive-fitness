
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExerciseFull } from '@/types/exercise';
import { Info, Plus, Trash2, Edit, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExerciseCardProps {
  exercise: ExerciseFull;
  onEdit?: (exercise: ExerciseFull) => void;
  onDelete?: (exercise: ExerciseFull) => void;
}

const ExerciseCard = ({ exercise, onEdit, onDelete }: ExerciseCardProps) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate(`/exercises/enhanced/${exercise.id}`);
  };
  
  const handleAddToWorkout = () => {
    // This would be implemented later with a modal
    console.log('Add to workout:', exercise.id);
  };

  // Helper function to extract YouTube video ID
  const getYouTubeVideoId = (url: string | null | undefined): string | null => {
    if (!url) return null;
    
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch {
      return null;
    }
  };
  
  // Get thumbnail from video URL
  const videoId = getYouTubeVideoId(exercise.short_youtube_demo);
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

  return (
    <Card className="overflow-hidden bg-black/30 border-gray-800 h-full flex flex-col">
      <div className="relative">
        {/* Thumbnail */}
        <div className="aspect-video bg-gray-900 relative overflow-hidden">
          {thumbnailUrl ? (
            <img 
              src={thumbnailUrl} 
              alt={exercise.name || "Exercise thumbnail"} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <Video className="h-12 w-12 text-gray-600" />
            </div>
          )}
          
          {/* Video overlay button */}
          {exercise.short_youtube_demo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button 
                size="sm"
                variant="secondary" 
                className="rounded-full bg-white/20 hover:bg-white/40"
                onClick={handleViewDetails}
              >
                <Video className="h-5 w-5 text-white" />
              </Button>
            </div>
          )}
          
          {/* Action buttons overlay */}
          <div className="absolute top-2 right-2 flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-black/50 text-white hover:bg-black/70"
                onClick={() => onEdit(exercise)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-black/50 text-white hover:bg-black/70"
                onClick={() => onDelete(exercise)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-medium mb-2 line-clamp-2">{exercise.name}</h3>
        
        {/* Tags/Badges */}
        <div className="flex flex-wrap gap-1 mb-4">
          {exercise.prime_mover_muscle && (
            <Badge variant="outline" className="bg-gray-800/50 text-xs">
              {exercise.prime_mover_muscle}
            </Badge>
          )}
          {exercise.primary_equipment && (
            <Badge variant="outline" className="bg-gray-800/50 text-xs">
              {exercise.primary_equipment}
            </Badge>
          )}
        </div>
        
        {/* Exercise specs */}
        <div className="text-sm mb-4 flex-1">
          {exercise.prime_mover_muscle && (
            <div className="mb-1">
              <span className="font-medium">Primary Muscle:</span>{" "}
              <span className="text-muted-foreground">{exercise.prime_mover_muscle}</span>
            </div>
          )}
          {exercise.mechanics && (
            <div className="mb-1">
              <span className="font-medium">Mechanics:</span>{" "}
              <span className="text-muted-foreground">{exercise.mechanics}</span>
            </div>
          )}
        </div>
        
        {/* Buttons */}
        <div className="mt-auto flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleViewDetails}
          >
            <Info className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button 
            className="flex-1"
            onClick={handleAddToWorkout}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Workout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;
