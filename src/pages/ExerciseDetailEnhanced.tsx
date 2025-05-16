
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExerciseFull } from '@/types/exercise';
import AppLayout from '@/components/layout/AppLayout';
import { getExerciseFullById } from '@/hooks/exercise-library/services/exercise-detail-service';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bookmark, BookmarkCheck, Play } from 'lucide-react';
import { DynamicBreadcrumb } from '@/components/ui/dynamic-breadcrumb';

// Components
import ExerciseDetailHeader from '@/components/exercises/exercise-detail/ExerciseDetailHeader';
import ExerciseDetailSkeleton from '@/components/exercises/exercise-detail/ExerciseDetailSkeleton';
import ExerciseNotFound from '@/components/exercises/exercise-detail/ExerciseNotFound';
import ExerciseMainDetails from '@/components/exercises/exercise-detail/ExerciseMainDetails';
import ExerciseSidebarInfo from '@/components/exercises/exercise-detail/ExerciseSidebarInfo';
import AddToWorkoutButton from '@/components/exercises/AddToWorkoutButton';
import { useToast } from '@/components/ui/use-toast';

export default function ExerciseDetailEnhanced() {
  const [exercise, setExercise] = useState<ExerciseFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // Handle both numeric and string IDs
        const exerciseId = typeof id === 'string' && !isNaN(parseInt(id)) 
          ? parseInt(id, 10) 
          : id;
          
        console.log(`Fetching exercise with ID: ${exerciseId}`);
        
        const exerciseData = await getExerciseFullById(exerciseId);
        console.log("Exercise data fetched:", exerciseData);
        
        setExercise(exerciseData);
      } catch (error) {
        console.error('Error fetching exercise:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [id]);

  const handleBackClick = () => {
    navigate('/exercises/enhanced');
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    
    toast({
      title: isSaved ? "Exercise removed from favorites" : "Exercise saved to favorites",
      description: isSaved ? "The exercise has been removed from your favorites" : "The exercise has been added to your favorites",
    });
  };

  // Function to check if exercise has video content
  const hasVideoContent = () => {
    return exercise && (exercise.short_youtube_demo || exercise.in_depth_youtube_exp);
  };

  if (loading) {
    return (
      <AppLayout>
        <ExerciseDetailSkeleton onBackClick={handleBackClick} />
      </AppLayout>
    );
  }

  if (!exercise) {
    return (
      <AppLayout>
        <ExerciseNotFound onBackClick={handleBackClick} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <DynamicBreadcrumb onBack={handleBackClick} className="mb-6" />
        
        {/* Action buttons */}
        <div className="flex justify-end items-center mb-6 gap-2">
          <Button 
            variant="outline"
            onClick={handleToggleSave}
            className="flex items-center gap-1"
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="h-4 w-4 text-primary" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
          
          {exercise && (
            <AddToWorkoutButton 
              exercise={exercise}
              variant="default"
            />
          )}
        </div>
        
        <ExerciseDetailHeader 
          exercise={exercise} 
          showBackButton={false}
        />
        
        {/* If there's video, show a prominent badge */}
        {hasVideoContent() && (
          <div className="flex items-center text-sm text-primary mb-3">
            <Play className="h-4 w-4 mr-1 text-primary" />
            <span>Video demonstration available</span>
          </div>
        )}
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2">
            <ExerciseMainDetails exercise={exercise} />
          </div>
          
          {/* Right Column - Sidebar Information */}
          <div>
            <ExerciseSidebarInfo exercise={exercise} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
