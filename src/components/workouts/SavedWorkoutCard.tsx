
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserWorkout } from "@/types/workout";
import { Calendar, Clock, Dumbbell, Edit, Trash2 } from "lucide-react";
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface SavedWorkoutCardProps {
  userWorkout: UserWorkout;
  onRemove: (workout: UserWorkout) => Promise<void>;
}

const SavedWorkoutCard: React.FC<SavedWorkoutCardProps> = ({ 
  userWorkout, 
  onRemove 
}) => {
  const { workout } = userWorkout;
  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this workout?")) {
      await onRemove(userWorkout);
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <Link to={`/workout-player/${workout.id}`}>
        <div className="aspect-video bg-muted relative overflow-hidden">
          {workout.category && (
            <Badge className="absolute top-2 right-2 capitalize bg-fitness-secondary text-white">
              {workout.category}
            </Badge>
          )}
          
          <div className="w-full h-full flex items-center justify-center bg-muted overflow-hidden">
            <img 
              src={workout.thumbnail_url || '/fittrackpro-logo.jpg'} 
              alt={workout.thumbnail_url ? workout.title : 'Default workout thumbnail'} 
              className="w-full h-full object-contain p-4"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'cover'
              }}
              onError={(e) => {
                // Fallback to default image on error
                const img = e.target as HTMLImageElement;
                if (!img.src.endsWith('fittrackpro-logo.jpg')) {
                  img.src = '/fittrackpro-logo.jpg';
                  img.onerror = null; // Prevent infinite loop if default image fails
                }
              }}
            />
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-bold text-lg truncate">{workout.title}</h3>
          
          {workout.description && (
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {workout.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{workout.duration || 30} min</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Dumbbell className="h-4 w-4 mr-1" />
              <span className="capitalize">{workout.difficulty}</span>
            </div>
          </div>
          
          {userWorkout.date && (
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Created: {userWorkout.date}</span>
            </div>
          )}
        </CardContent>
      </Link>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          asChild
        >
          <Link to={`/workout-builder/${workout.id}`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
        <Button 
          size="sm"
          className="ml-2"
          asChild
        >
          <Link to={`/workout-player/${workout.id}`}>
            <Dumbbell className="h-4 w-4 mr-2" />
            Start
          </Link>
        </Button>
        
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SavedWorkoutCard;
