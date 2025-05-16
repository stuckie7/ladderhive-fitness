
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExerciseFull } from '@/types/exercise';
import { getExerciseFullById } from '@/hooks/exercise-library/services/exercise-detail-service';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Components
import ExerciseDetailSkeleton from '@/components/exercises/exercise-detail/ExerciseDetailSkeleton';
import ExerciseNotFound from '@/components/exercises/exercise-detail/ExerciseNotFound';
import ExerciseMainDetails from '@/components/exercises/exercise-detail/ExerciseMainDetails';

export default function ExerciseDetailEnhanced() {
  const [exercise, setExercise] = useState<ExerciseFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const exerciseId = typeof id === 'string' && !isNaN(parseInt(id)) 
          ? parseInt(id, 10) 
          : id;
        const exerciseData = await getExerciseFullById(exerciseId);
        setExercise(exerciseData);
      } catch (error) {
        console.error('Error fetching exercise:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [id]);

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from favorites" : "Saved to favorites",
      variant: "default",
    });
  };

  const handleBackClick = () => {
    navigate('/exercises');
  };

  if (loading) return <ExerciseDetailSkeleton />;
  if (!exercise) return <ExerciseNotFound onBackClick={handleBackClick} />;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header with Save Button */}
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-2xl font-bold">{exercise.name}</h1>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleToggleSave}
          className="text-muted-foreground"
        >
          {isSaved ? (
            <BookmarkCheck className="h-5 w-5 text-primary" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Main content with tabs */}
      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {exercise.short_youtube_demo && (
              <TabsTrigger value="video">Video</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* In-depth Video */}
            {exercise.in_depth_youtube_exp && (
              <div className="bg-card rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">In-Depth Video Explanation</h3>
                <div className="aspect-video rounded-md overflow-hidden">
                  <iframe 
                    src={`https://www.youtube.com/embed/${extractYoutubeId(exercise.in_depth_youtube_exp)}`} 
                    title="In-Depth Explanation"
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
            
            {/* Main Details */}
            <ExerciseMainDetails exercise={exercise} />
          </TabsContent>

          {exercise.short_youtube_demo && (
            <TabsContent value="video">
              <div className="bg-card rounded-lg p-6">
                <div className="aspect-video rounded-md overflow-hidden">
                  <iframe 
                    src={`https://www.youtube.com/embed/${extractYoutubeId(exercise.short_youtube_demo)}`} 
                    title="Quick Demonstration"
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

// Helper to extract YouTube ID from URL
function extractYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
