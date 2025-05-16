
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkoutDetail } from '@/hooks/workout-detail';
import { Exercise } from '@/types/exercise';
import AppLayout from '@/components/layout/AppLayout';

// Import the components requested
import WorkoutDetailHeader from '@/components/workouts/detail/WorkoutDetailHeader';
import DescriptionCard from '@/components/workouts/detail/DescriptionCard';
import VideoEmbed from '@/components/workouts/detail/VideoEmbed';
import WorkoutExerciseSection from '@/components/workouts/WorkoutExerciseSection';
import WorkoutAdditionalInfo from '@/components/workouts/detail/WorkoutAdditionalInfo';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use the combined workout detail hook
  const {
    workout,
    isLoading,
    isSaved,
    workoutExercises,
    exercisesLoading,
    error,
    handleAddExercise,
    handleSaveWorkout,
    handleCompleteWorkout,
    removeExerciseFromWorkout
  } = useWorkoutDetail(id);
  
  // States for UI feedback
  const [isStarting, setIsStarting] = useState(false);
  
  // Handle starting a workout (navigate to workout session)
  const handleStartWorkout = async () => {
    setIsStarting(true);
    try {
      // Implement workout start logic here
      toast({
        title: "Coming Soon",
        description: "Workout session feature will be available soon!",
      });
    } catch (error) {
      console.error('Error starting workout:', error);
      toast({
        title: "Error",
        description: "Failed to start workout",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  // Handle saving/unsaving a workout
  const toggleSaveWorkout = async () => {
    try {
      await handleSaveWorkout(!isSaved);
      toast({
        title: isSaved ? "Workout Unsaved" : "Workout Saved",
        description: isSaved ? "Workout removed from saved workouts" : "Workout added to saved workouts",
      });
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Error",
        description: "Failed to save/unsave workout",
        variant: "destructive",
      });
    }
  };
  
  // Handle back navigation
  const handleBackClick = () => {
    navigate('/workouts');
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
          <Spinner />
        </div>
      </AppLayout>
    );
  }
  
  if (error || !workout) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Error Loading Workout</h2>
            <p className="mb-4">{error || "Workout not found"}</p>
            <Button onClick={handleBackClick}>Go Back to Workouts</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" className="mb-6" onClick={handleBackClick}>
          <div className="flex items-center">
            <span className="mr-2">←</span>
            Back
          </div>
        </Button>
        
        {/* WorkoutDetailHeader - Combined title, description and actions */}
        <WorkoutDetailHeader 
          title={workout.title}
          description={workout.description}
          difficulty={workout.difficulty || "Not specified"}
          duration={workout.duration || workout.duration_minutes || 0}
          exerciseCount={workoutExercises?.length || 0}
        />
        
        {/* Video embed if available */}
        <VideoEmbed videoUrl={workout.video_url} thumbnailUrl={workout.thumbnail_url} />
        
        {/* Description card */}
        <DescriptionCard 
          description={workout.long_description || workout.description} 
          benefits={workout.benefits}
        />
        
        {/* Exercise section with circuit view option */}
        <WorkoutExerciseSection 
          workoutId={id}
          exercises={workoutExercises || []}
          isLoading={exercisesLoading}
          onAddExercise={handleAddExercise}
          onRemoveExercise={removeExerciseFromWorkout}
          viewMode="circuit" // Set default to circuit view
        />
        
        {/* Additional information */}
        <WorkoutAdditionalInfo
          goal={workout.goal}
          category={workout.category}
          equipment_needed={workout.equipment_needed}
          instructions={workout.instructions}
          modifications={workout.modifications}
          created_at={workout.created_at}
        />
        
        {/* Action buttons at the bottom */}
        <div className="flex gap-4 mt-8 justify-center">
          <Button
            variant="outline"
            onClick={toggleSaveWorkout}
            disabled={isLoading}
            className={isSaved ? "text-amber-500" : ""}
          >
            {isSaved ? "Saved" : "Save Workout"}
          </Button>
          
          <Button 
            className="bg-fitness-primary hover:bg-fitness-primary/90"
            onClick={handleStartWorkout}
            disabled={isStarting}
          >
            {isStarting ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Start Workout
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
