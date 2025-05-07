
import { Exercise } from "@/types/exercise";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Play, Youtube, Dumbbell, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExerciseVideoHandler from "./ExerciseVideoHandler";

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate(`/exercises/${exercise.id}`);
  };
  
  const getPrimaryIcon = () => {
    if (exercise.video_url && exercise.video_url.includes('youtube')) {
      return <Youtube className="h-5 w-5 text-red-500" />;
    } else if (exercise.equipment && exercise.equipment.toLowerCase() !== 'bodyweight') {
      return <Dumbbell className="h-5 w-5 text-blue-500" />;
    } else {
      return <Activity className="h-5 w-5 text-green-500" />;
    }
  };

  // Determine video URL from any available video field
  const videoUrl = exercise.video_url || 
                  exercise.video_demonstration_url || 
                  exercise.short_youtube_demo;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{exercise.name}</CardTitle>
          {getPrimaryIcon()}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="aspect-video bg-muted rounded-md mb-3 relative overflow-hidden">
          {exercise.image_url ? (
            <img
              src={exercise.image_url}
              alt={exercise.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No image available
            </div>
          )}
          {videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
              <ExerciseVideoHandler
                url={videoUrl}
                title="Play Video"
                className="rounded-full bg-white text-black border-0"
                showPlaceholder={false}
              />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {/* Target muscle group badge */}
            {exercise.muscle_group && (
              <Badge variant="outline" className="bg-muted/50">
                {exercise.muscle_group}
              </Badge>
            )}
            
            {/* Equipment badge */}
            {exercise.equipment && (
              <Badge variant="outline" className="bg-muted/50">
                {exercise.equipment}
              </Badge>
            )}
            
            {/* Difficulty badge */}
            {exercise.difficulty && (
              <Badge className={`
                ${exercise.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                ${exercise.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                ${exercise.difficulty === 'Advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : ''}
              `}>
                {exercise.difficulty}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-3">
            {exercise.description || "No description available."}
          </p>
          
          {/* Additional details for exercises with more information */}
          {(exercise.secondaryMuscles?.length > 0 || exercise.bodyPart) && (
            <div className="text-xs text-muted-foreground mt-2">
              {exercise.bodyPart && exercise.bodyPart !== exercise.muscle_group && (
                <p><span className="font-medium">Body Region:</span> {exercise.bodyPart}</p>
              )}
              {exercise.secondaryMuscles?.length > 0 && (
                <p><span className="font-medium">Secondary Muscles:</span> {exercise.secondaryMuscles.join(', ')}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" className="w-full" onClick={handleViewDetails}>
          <Info className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExerciseCard;
