
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
import { Skeleton } from '@/components/ui/skeleton';

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
          description={workout.description}
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
        
        <DescriptionCard 
          description={workout.long_description || workout.description} 
          benefits={workout.benefits}
        />
        
        <WorkoutCircuit exercises={workout.exercises} />
        
        <div className="mt-6">
          <Button className="w-full sm:w-auto bg-fitness-primary hover:bg-fitness-primary/90">
            <PlayCircle className="mr-2 h-5 w-5" />
            Start Workout
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkoutDetailEnhanced;
