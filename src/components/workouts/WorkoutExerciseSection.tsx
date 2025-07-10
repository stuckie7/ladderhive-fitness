import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Search, Clock, Play } from "lucide-react";
import ExerciseSearchModal from "@/components/exercises/ExerciseSearchModal";
import WorkoutExerciseSkeleton from "@/components/workouts/WorkoutExerciseSkeleton";
import { Exercise } from "@/types/exercise";
import { WorkoutExercise } from "@/types/workout";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Helper function to extract YouTube video ID from URL
const getYoutubeId = (url: string | undefined): string | null => {
  if (!url) return null;
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1].split(/[?&#]/)[0];
  }
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
};

// Helper function to get YouTube embed URL
const getYoutubeEmbedUrl = (url: string | undefined): string | null => {
  const videoId = getYoutubeId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
};

// Define the interface for the exercise list items to match ExerciseList component
interface ExerciseListItem {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  restTime?: number;
  description?: string;
  demonstration?: string;
  thumbnailUrl?: string;
}

interface WorkoutExerciseSectionProps {
  workoutId?: string;
  exercises: WorkoutExercise[];
  isLoading: boolean;
  onAddExercise: (exercise: Exercise) => Promise<void>;
  onRemoveExercise?: (exerciseId: string) => void;
  viewMode?: string; // Add the missing viewMode prop
}

const WorkoutExerciseSection = ({ 
  workoutId, 
  exercises, 
  isLoading, 
  onAddExercise,
  onRemoveExercise,
  viewMode = "list" // Default to list view if not provided
}: WorkoutExerciseSectionProps) => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const handleAddExercise = async (exercise: Exercise): Promise<void> => {
    await onAddExercise(exercise);
    setSearchModalOpen(false);
  };

  // Ensures any reps value is converted to string
  const ensureStringReps = (reps: string | number | undefined): string => {
    if (reps === undefined) return '';
    return reps.toString();
  };

  // Format exercises with all necessary data
  const formattedExercises = exercises.map(we => ({
    id: we.id,
    name: we.exercise?.name || "Unknown Exercise",
    sets: we.sets,
    reps: ensureStringReps(we.reps),
    weight: we.weight ? String(we.weight) : undefined,
    restTime: we.rest_seconds || we.rest_time || 60,
    description: we.exercise?.description,
    videoUrl: we.exercise?.video_demonstration_url || 
             we.exercise?.video_url || 
             we.exercise?.short_youtube_demo,
    thumbnailUrl: we.exercise?.youtube_thumbnail_url ||
                we.exercise?.image_url,
    exercise: we.exercise
  }));
  
  // Calculate total workout time
  const totalWorkoutTime = formattedExercises.reduce((total, ex) => {
    // Estimate 45 seconds per set (30s work + 15s rest)
    return total + (ex.sets * 45) + (ex.restTime || 0);
  }, 0);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Workout Exercises</h2>
          {formattedExercises.length > 0 && (
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Dumbbell className="h-4 w-4 mr-1" />
                {formattedExercises.length} {formattedExercises.length === 1 ? 'Exercise' : 'Exercises'}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(totalWorkoutTime)}
              </div>
            </div>
          )}
        </div>
        {viewMode !== 'readonly' && (
          <Button 
            onClick={() => setSearchModalOpen(true)}
            className="bg-fitness-primary hover:bg-fitness-primary/90"
          >
            <Search className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <WorkoutExerciseSkeleton />
      ) : formattedExercises.length > 0 && (
        <div className="space-y-4">
          {formattedExercises.map((exercise, index) => {
            const embedUrl = exercise.videoUrl ? getYoutubeEmbedUrl(exercise.videoUrl) : null;
            
            return (
              <Card key={exercise.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {exercise.thumbnailUrl && (
                    <div className="w-full md:w-48 flex-shrink-0 relative cursor-pointer" 
                         onClick={() => embedUrl && setSelectedVideo(embedUrl)}>
                      <div className="aspect-video w-full h-full bg-muted relative">
                        <img 
                          src={exercise.thumbnailUrl}
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                        />
                        {embedUrl && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="h-10 w-10 text-white" fill="currentColor" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg">
                        {index + 1}. {exercise.name}
                      </h3>
                      {onRemoveExercise && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onRemoveExercise(exercise.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="gap-1">
                        <span>{exercise.sets}x</span>
                        <span className="text-muted-foreground">sets</span>
                      </Badge>
                      
                      <Badge variant="outline" className="gap-1">
                        <span>{exercise.reps}</span>
                        <span className="text-muted-foreground">reps</span>
                      </Badge>
                      
                      {exercise.weight && (
                        <Badge variant="outline" className="gap-1">
                          <span>{exercise.weight} lbs</span>
                        </Badge>
                      )}
                      
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{exercise.restTime}s rest</span>
                      </Badge>
                    </div>
                    
                    {exercise.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {exercise.description}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
          {selectedVideo && (
            <div className="aspect-video w-full">
              <iframe
                src={selectedVideo}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ExerciseSearchModal 
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
        onAddExercise={handleAddExercise}
        workoutId={workoutId}
      />
    </>
  );
};

export default WorkoutExerciseSection;
