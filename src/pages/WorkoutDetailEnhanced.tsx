import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useWorkoutDetailEnhanced } from '@/hooks/workouts/use-workout-detail-enhanced';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock, Dumbbell } from 'lucide-react';
import DescriptionCard from '@/components/workouts/detail/DescriptionCard';
import WorkoutAdditionalInfo from '@/components/workouts/detail/WorkoutAdditionalInfo';
import VideoEmbed from '@/components/workouts/detail/VideoEmbed';
import WorkoutCircuit from '@/components/workouts/detail/WorkoutCircuit';

const WorkoutDetailEnhanced: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workout, isLoading, error } = useWorkoutDetailEnhanced(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const getDifficultyColor = (difficulty: string | undefined) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'all levels':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" className="mb-6" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-[300px] w-full aspect-video" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-48" />
            <Skeleton className="h-96" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Error Loading Workout</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={handleBack}>
              Return to Workouts
            </Button>
          </div>
        ) : workout ? (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{workout.title}</h1>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="outline" className={getDifficultyColor(workout.difficulty)}>
                  {workout.difficulty}
                </Badge>
                <Badge variant="secondary" className="bg-accent">
                  {workout.category}
                </Badge>
                {workout.goal && (
                  <Badge variant="outline">{workout.goal}</Badge>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  {workout.duration_minutes} min
                </div>
              </div>
            </div>
            
            {/* Video */}
            <VideoEmbed videoUrl={workout.video_url} />
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex items-center">
                  <Clock className="h-6 w-6 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{workout.duration_minutes} minutes</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center">
                  <Dumbbell className="h-6 w-6 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Exercises</p>
                    <p className="font-medium">{workout.exercises?.length || 0}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center">
                  <div className="h-6 w-6 mr-3 flex items-center justify-center text-muted-foreground">
                    {workout.category === 'Strength' && <Dumbbell className="h-5 w-5" />}
                    {workout.category === 'Cardio' && <Clock className="h-5 w-5" />}
                    {!['Strength', 'Cardio'].includes(workout.category || '') && '#'}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Workout Type</p>
                    <p className="font-medium">{workout.category} - {workout.difficulty}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Description */}
            <DescriptionCard 
              description={workout.long_description || workout.description} 
              benefits={workout.benefits} 
            />
            
            {/* Exercise Circuit */}
            <WorkoutCircuit 
              exercises={workout.exercises || []} 
              isLoading={isLoading}
            />
            
            {/* Additional Info */}
            <WorkoutAdditionalInfo
              goal={workout.goal}
              category={workout.category}
              equipment_needed={workout.equipment_needed}
              instructions={workout.instructions}
              modifications={workout.modifications}
              created_at={workout.created_at}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Workout Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The workout you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBack}>
              Return to Workouts
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default WorkoutDetailEnhanced;
