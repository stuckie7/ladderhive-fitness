import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Dumbbell, Bookmark, BookmarkCheck, Play, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWorkouts } from "@/hooks/use-workouts";
import { useToast } from "@/components/ui/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkoutCardProps {
  workout: {
    id: string;
    title: string;
    description: string;
    duration: number;
    exercises: number;
    difficulty: string;
    date?: string;
    thumbnail_url?: string;
    video_url?: string;
    is_new?: boolean;
    is_popular?: boolean;
    is_featured?: boolean;
    trainer?: string;
    category?: string;
  };
  isSaved?: boolean;
}

const WorkoutCard = ({ workout, isSaved = false }: WorkoutCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState(isSaved);
  const [isLoading, setIsLoading] = useState(false);
  const { saveWorkout, unsaveWorkout } = useWorkouts();
  const [isHovered, setIsHovered] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'elite':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
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
      case 'core':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleSaveWorkout = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save workouts.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      if (saved) {
        const result = await unsaveWorkout(workout.id);
        if (result.success) {
          setSaved(false);
        }
      } else {
        const result = await saveWorkout(workout.id);
        if (result.success) {
          setSaved(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWorkout = () => {
    navigate(`/workouts/${workout.id}`);
  };

  const handleWorkoutDetails = () => {
    navigate(`/workouts/${workout.id}`);
  };

  // Use YouTube video ID to get thumbnail if available, or fall back to thumbnail_url
  const getWorkoutThumbnail = () => {
    if (workout.video_url) {
      const videoIdMatch = workout.video_url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
      if (videoIdMatch) {
        return `https://img.youtube.com/vi/${videoIdMatch[1]}/hqdefault.jpg`;
      }
    }
    return workout.thumbnail_url || '/placeholder.svg';
  };

  return (
    <Card 
      className={`workout-card overflow-hidden h-full flex flex-col transition-all duration-300 ${
        isHovered ? "shadow-lg transform scale-[1.02]" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <AspectRatio ratio={16/9}>
          <img 
            src={getWorkoutThumbnail()} 
            alt={workout.title} 
            className="object-cover w-full h-full rounded-t-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </AspectRatio>
        
        {/* Special badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {workout.is_new && (
            <Badge variant="default" className="bg-green-500">New</Badge>
          )}
          {workout.is_popular && (
            <Badge variant="default" className="bg-amber-500">Popular</Badge>
          )}
          {workout.is_featured && (
            <Badge variant="default" className="bg-purple-500">Featured</Badge>
          )}
        </div>
        
        {/* Difficulty badge */}
        <div className="absolute top-2 right-2">
          <Badge className={getDifficultyColor(workout.difficulty)}>
            {workout.difficulty}
          </Badge>
        </div>
        
        {/* Play button overlay */}
        {workout.video_url && (
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            onClick={handleStartWorkout}
          >
            <div className="bg-black/50 rounded-full p-3">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold line-clamp-2" title={workout.title}>{workout.title}</CardTitle>
        </div>
        
        {workout.trainer && (
          <div className="flex items-center gap-2 mt-1">
            <div className="h-5 w-5 rounded-full bg-gray-300"></div>
            <span className="text-xs text-muted-foreground">{workout.trainer}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pb-4 flex-grow">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{workout.description}</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{workout.duration} min</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Dumbbell className="h-4 w-4" />
            <span>{workout.exercises} exercises</span>
          </div>
          {workout.date && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{workout.date}</span>
            </div>
          )}
          {workout.category && (
            <Badge className={getCategoryColor(workout.category)} variant="secondary">
              {workout.category}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex gap-2">
        <Button 
          className="flex-1 bg-fitness-primary hover:bg-fitness-primary/90"
          onClick={handleStartWorkout}
        >
          <Play className="mr-2 h-4 w-4" />
          Start Workout
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          disabled={isLoading}
          onClick={handleSaveWorkout}
          className={saved ? "text-fitness-primary" : ""}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleWorkoutDetails}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSaveWorkout}>
              {saved ? "Unsave" : "Save"} Workout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

export default WorkoutCard;
