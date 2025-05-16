
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExerciseFull } from '@/types/exercise';
import { getExerciseFullById } from '@/hooks/exercise-library/services/exercise-detail-service';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Components
import ExerciseDetailSkeleton from '@/components/exercises/exercise-detail/ExerciseDetailSkeleton';
import ExerciseNotFound from '@/components/exercises/exercise-detail/ExerciseNotFound';

export default function ExerciseDetailSimplified() {
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

  // Using in_depth_youtube_exp or short_youtube_demo for the video
  const videoUrl = exercise.in_depth_youtube_exp || exercise.short_youtube_demo;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Video Section (Prominent) */}
      {videoUrl && (
        <div className="mb-6 rounded-lg overflow-hidden aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${extractYoutubeId(videoUrl)}`}
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      )}

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

      {/* Description (Simple Markdown) */}
      <div className="prose prose-sm max-w-none">
        {exercise.description && exercise.description.split('\n').map((para, i) => (
          <p key={i} className="mb-4 last:mb-0">{para}</p>
        ))}
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
