
import { Exercise } from "@/types/exercise";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate(`/exercises/${exercise.id}`);
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{exercise.name}</CardTitle>
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
          {exercise.video_url && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
              <Button variant="outline" size="icon" className="rounded-full bg-white text-black border-0">
                <Play className="h-6 w-6 fill-current" />
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {exercise.muscle_group && (
              <Badge variant="outline" className="bg-muted/50">
                {exercise.muscle_group}
              </Badge>
            )}
            {exercise.equipment && (
              <Badge variant="outline" className="bg-muted/50">
                {exercise.equipment}
              </Badge>
            )}
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
          <p className="text-sm text-muted-foreground line-clamp-2">
            {exercise.description || "No description available."}
          </p>
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
