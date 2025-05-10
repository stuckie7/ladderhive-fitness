
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { useWorkoutDetailEnhanced } from '@/hooks/workouts/use-workout-detail-enhanced';
import WorkoutDetailHeader from '@/components/workouts/detail/WorkoutDetailHeader';
import VideoEmbed from '@/components/workouts/detail/VideoEmbed';
import DescriptionCard from '@/components/workouts/detail/DescriptionCard';
import WorkoutCircuit from '@/components/workouts/detail/WorkoutCircuit';
import ExerciseList from '@/components/workouts/detail/ExerciseList';
import WorkoutAdditionalInfo from '@/components/workouts/detail/WorkoutAdditionalInfo';
import { Skeleton } from '@/components/ui/skeleton';

// Define the specific exercise shape needed for WorkoutCircuit and make it compatible with ExerciseList
interface CircuitExercise {
  id: string;
  name: string;
  sets: number;
  reps: string | number;
  rest_seconds?: number;
  notes?: string;
  modifications?: string;
  exercise: {
    name: string; // Make this required to match WorkoutExercise
    description?: string;
    video_demonstration_url?: string;
    short_youtube_demo?: string;
    youtube_thumbnail_url?: string;
  };
}

const WorkoutDetailEnhanced: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workout, isLoading, error } = useWorkoutDetailEnhanced(id);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              disabled
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Skeleton className="h-8 w-64" />
          </div>
          
          <Skeleton className="h-[400px] w-full mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          
          <Skeleton className="h-64 w-full mb-6" />
        </div>
      </AppLayout>
    );
  }

  if (error || !workout) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/workouts')}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Workout Not Found</h1>
          </div>
          
          <p className="text-muted-foreground">
            Sorry, the workout you're looking for doesn't exist or couldn't be loaded.
          </p>
          
          <Button 
            className="mt-6"
            onClick={() => navigate('/workouts')}
          >
            Back to Workouts
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Transform workout exercises to match CircuitExercise interface
  const circuitExercises: CircuitExercise[] = workout.exercises.map(ex => ({
    id: ex.id,
    name: ex.exercise?.name || "Unknown Exercise",
    sets: ex.sets,
    reps: ex.reps,
    rest_seconds: ex.rest_seconds,
    notes: ex.notes,
    modifications: ex.modifications,
    exercise: {
      name: ex.exercise?.name || "Unknown Exercise", // Ensure name is always defined
      description: ex.exercise?.description,
      video_demonstration_url: ex.exercise?.video_demonstration_url,
      short_youtube_demo: ex.exercise?.short_youtube_demo,
      youtube_thumbnail_url: ex.exercise?.youtube_thumbnail_url
    }
  }));

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/workouts')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        
        <WorkoutDetailHeader 
          title={workout.title}
          description={workout.short_description || workout.description}
          difficulty={workout.difficulty}
          duration={workout.duration_minutes}
          exerciseCount={workout.exercises?.length || 0}
        />
        
        {workout.video_url && (
          <VideoEmbed 
            videoUrl={workout.video_url} 
            thumbnailUrl={workout.thumbnail_url} 
          />
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <DescriptionCard 
              description={workout.long_description || workout.description} 
              benefits={workout.benefits}
            />
            
            <div className="mb-6">
              <WorkoutCircuit exercises={circuitExercises} />
            </div>
            
            <WorkoutAdditionalInfo
              goal={workout.goal}
              category={workout.category}
              equipment_needed={workout.equipment_needed}
              benefits={workout.benefits}
              instructions={workout.instructions}
              modifications={workout.modifications}
              created_at={workout.created_at}
            />
          </div>
          
          <div>
            <div className="sticky top-6">
              <ExerciseList exercises={circuitExercises} />
              
              <div className="mt-6">
                <Button className="w-full bg-fitness-primary hover:bg-fitness-primary/90">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Start Workout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkoutDetailEnhanced;
