
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark, BookmarkCheck, Clock, Video } from 'lucide-react';
import { Wod } from '@/types/wod';
import StartWodButton from './StartWodButton';

interface WodDetailProps {
  wod: Wod;
  onToggleFavorite: (wodId: string) => Promise<void>;
}

const WodDetail: React.FC<WodDetailProps> = ({ wod, onToggleFavorite }) => {
  const getDifficultyColor = (difficulty: string | undefined) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'elite':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string | undefined) => {
    switch (category?.toLowerCase()) {
      case 'girl':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'hero':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'benchmark':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{wod.name}</h1>
          <div className="flex flex-wrap gap-2">
            {wod.category && (
              <Badge className={getCategoryColor(wod.category)}>
                {wod.category}
              </Badge>
            )}
            {wod.difficulty && (
              <Badge variant="outline" className={getDifficultyColor(wod.difficulty)}>
                {wod.difficulty}
              </Badge>
            )}
            {wod.avg_duration_minutes && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{wod.avg_duration_minutes} min</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onToggleFavorite(wod.id)}
            className={wod.is_favorite ? "text-amber-500" : ""}
          >
            {wod.is_favorite ? (
              <>
                <BookmarkCheck className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          
          <StartWodButton wod={wod} />
        </div>
      </div>
      
      {/* Description */}
      {wod.description && (
        <div className="text-muted-foreground">
          {wod.description}
        </div>
      )}
      
      {/* Video */}
      {wod.video_url && (
        <div className="aspect-video rounded-lg overflow-hidden">
          <iframe 
            width="100%" 
            height="100%" 
            src={convertYouTubeUrlToEmbed(wod.video_url)}
            title={`${wod.name} Demo`}
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      )}
      
      {/* Components */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Workout Components</h2>
          <div className="space-y-4">
            {wod.components.sort((a, b) => a.order - b.order).map((component) => (
              <div key={component.order} className="py-2 border-b last:border-b-0">
                <p className="whitespace-pre-line">{component.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to convert YouTube URLs to embed format
const convertYouTubeUrlToEmbed = (url: string): string => {
  // Extract YouTube video ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  
  // Return the original URL if it doesn't match the pattern
  return url;
};

export default WodDetail;
