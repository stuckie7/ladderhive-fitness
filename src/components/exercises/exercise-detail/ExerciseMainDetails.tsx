import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Exercise } from "@/types/exercise";
import ExerciseSpecItem from "./ExerciseSpecItem";
import ExerciseVideoHandler from "@/components/exercises/ExerciseVideoHandler";
import { Skeleton } from "@/components/ui/skeleton";

interface ExerciseMainDetailsProps {
  exercise: Exercise;
}

export const getEmbeddedYoutubeUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove quotes if they exist in the URL
  let cleanUrl = url.replace(/^['"]|['"]$/g, '');
  
  // Handle youtube.com/watch?v= format
  if (cleanUrl.includes('watch?v=')) {
    return cleanUrl.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/, 'https://www.youtube.com/embed/$1');
  }
  
  // Handle youtu.be/ format
  if (cleanUrl.includes('youtu.be/')) {
    return cleanUrl.replace(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/(.+)/, 'https://www.youtube.com/embed/$1');
  }
  
  // If it's already in the embed format or can't be parsed, return as is
  return cleanUrl;
};

export default function ExerciseMainDetails({ exercise }: ExerciseMainDetailsProps) {
  // Ensure we have at least one video URL before showing video section
  const videoUrls = [
    exercise.in_depth_youtube_exp || '',
    exercise.short_youtube_demo || '',
    exercise.video_explanation_url || '',
    exercise.video_demonstration_url || '',
    exercise.video_url || ''
  ].filter(url => url);
  
  const hasVideo = videoUrls.length > 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Video Content */}
        {hasVideo && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-2">Video Demonstration</h3>
            <ExerciseVideoHandler
              exercise={{
                ...exercise,
                in_depth_youtube_exp: exercise.in_depth_youtube_exp || '',
                short_youtube_demo: exercise.short_youtube_demo || '',
                video_explanation_url: exercise.video_explanation_url || '',
                video_demonstration_url: exercise.video_demonstration_url || '',
                video_url: exercise.video_url || ''
              }}
              title="Exercise Demonstration"
              className="aspect-video bg-muted rounded-md overflow-hidden"
            />
          </div>
        )}
        
        {/* Exercise Specifications */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium mb-2">Exercise Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExerciseSpecItem
              label="Equipment"
              value={exercise.equipment || 'Bodyweight'}
            />
            <ExerciseSpecItem
              label="Difficulty"
              value={exercise.difficulty || 'Beginner'}
            />
            <ExerciseSpecItem
              label="Target Muscle"
              value={exercise.target || 'Unknown'}
            />
            <ExerciseSpecItem
              label="Video Available"
              value={hasVideo ? 'Yes' : 'No'}
            />
          </div>
        </div>

        {/* Exercise Mechanics */}
        <div>
          <h3 className="text-lg font-medium mb-2">Exercise Mechanics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExerciseSpecItem
              label="Primary Equipment"
              value={exercise.primary_equipment || 'N/A'}
            />
            <ExerciseSpecItem
              label="Secondary Equipment"
              value={exercise.secondary_equipment || 'N/A'}
            />
            <ExerciseSpecItem
              label="Mechanics"
              value={exercise.mechanics || 'N/A'}
            />
            <ExerciseSpecItem
              label="Force Type"
              value={exercise.force_type || 'N/A'}
            />
            <ExerciseSpecItem
              label="Posture"
              value={exercise.posture || 'N/A'}
            />
          </div>
        </div>
        {/* Description */}
        <div>
          <h3 className="text-lg font-medium mb-2">Description</h3>
          <div className="space-y-4">
            <ExerciseSpecItem
              label="Description"
              value={exercise.description || 'No description available'}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
