
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExerciseFull } from '@/types/exercise';
import { getExerciseFullById } from '@/hooks/exercise-library/services/exercise-detail-service';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/components/layout/AppLayout';

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
        
        // Debug log to check the exercise data
        console.log('Fetched exercise data:', {
          id: exerciseData?.id,
          name: exerciseData?.name,
          short_youtube_demo: exerciseData?.short_youtube_demo,
          in_depth_youtube_exp: exerciseData?.in_depth_youtube_exp,
          video_url: exerciseData?.video_url,
          video_demonstration_url: exerciseData?.video_demonstration_url,
          video_explanation_url: exerciseData?.video_explanation_url,
          youtube_thumbnail_url: exerciseData?.youtube_thumbnail_url
        });
        
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

  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    try {
      let videoId = '';
      
      // Handle YouTube watch URLs
      if (url.includes('youtube.com/watch')) {
        videoId = new URL(url).searchParams.get('v') || '';
      } 
      // Handle youtu.be shortened URLs
      else if (url.includes('youtu.be/')) {
        videoId = new URL(url).pathname.split('/').pop() || '';
      }
      
      if (videoId) {
        // Return YouTube embed URL with necessary parameters
        return `https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1&origin=${window.location.origin}`;
      }
      
      // If it's already an embed URL or some other format, return as is
      return url;
    } catch (error) {
      console.error('Error parsing video URL:', url, error);
      return '';
    }
  };

  if (loading) return <ExerciseDetailSkeleton />;
  if (!exercise) return <ExerciseNotFound onBackClick={handleBackClick} />;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Header with Back Button and Save Button */}
        <div className="flex justify-between items-start mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleBackClick}
            className="flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back</span>
          </Button>
          <h1 className="text-2xl font-bold text-center flex-1">{exercise.name}</h1>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleToggleSave}
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
              {(exercise.short_youtube_demo || exercise.video_demonstration_url || exercise.video_url) && (
                <TabsTrigger value="video">Video</TabsTrigger>
              )}
              {(exercise.in_depth_youtube_exp || exercise.video_explanation_url) && (
                <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Exercise Thumbnail */}
              {exercise.youtube_thumbnail_url && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={exercise.youtube_thumbnail_url} 
                    alt={exercise.name}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              
              {/* Main Details */}
              <ExerciseMainDetails exercise={exercise} />
            </TabsContent>

            {(exercise.short_youtube_demo || exercise.video_demonstration_url || exercise.video_url) && (
              <TabsContent value="video">
                <div className="bg-card rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Exercise Demonstration</h3>
                  <div className="aspect-video rounded-md overflow-hidden bg-black">
                    <iframe
                      src={getEmbedUrl(exercise.short_youtube_demo || exercise.video_demonstration_url || exercise.video_url || '')}
                      title="Exercise Demonstration"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                </div>
              </TabsContent>
            )}
            
            {(exercise.in_depth_youtube_exp || exercise.video_explanation_url) && (
              <TabsContent value="tutorial">
                <div className="bg-card rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">In-Depth Tutorial</h3>
                  <div className="aspect-video rounded-md overflow-hidden bg-black">
                    <iframe
                      src={getEmbedUrl(exercise.in_depth_youtube_exp || exercise.video_explanation_url || '')}
                      title="In-Depth Tutorial"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
