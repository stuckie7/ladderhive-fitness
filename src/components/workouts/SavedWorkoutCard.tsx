
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Dumbbell, Trash2, Edit, Play } from "lucide-react";
import { UserWorkout } from "@/types/workout";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface SavedWorkoutCardProps {
  userWorkout: UserWorkout;
  onRemove: (id: string) => Promise<boolean>;
}

const SavedWorkoutCard = ({ userWorkout, onRemove }: SavedWorkoutCardProps) => {
  const navigate = useNavigate();
  const { workout } = userWorkout;
  
  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onRemove(userWorkout.id);
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/workout-builder?template=${workout.id}`);
  };
  
  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/workouts/${workout.id}`);
  };
  
  const handleViewDetails = () => {
    navigate(`/workouts/${workout.id}`);
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const getCategoryColor = (category: string = '') => {
    switch (category.toLowerCase()) {
      case 'strength':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'cardio':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'yoga':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
      case 'hiit':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const saved_at = userWorkout.created_at 
    ? format(new Date(userWorkout.created_at), 'MMM dd, yyyy')
    : null;
  
  return (
    <Card 
      className="workout-card overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleViewDetails}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold line-clamp-2" title={workout.title}>
            {workout.title}
          </CardTitle>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className={getDifficultyColor(workout.difficulty)}>
            {workout.difficulty}
          </Badge>
          
          {workout.category && (
            <Badge className={getCategoryColor(workout.category)} variant="secondary">
              {workout.category}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 flex-grow">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {workout.description || "No description available."}
        </p>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{workout.duration} min</span>
          </div>
          
          {saved_at && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Saved: {saved_at}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex gap-2">
        <Button 
          className="flex-1"
          onClick={handleStart}
        >
          <Play className="mr-2 h-4 w-4" />
          Start
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleEdit}
          title="Edit workout"
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleRemove}
          title="Remove from saved"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SavedWorkoutCard;
