
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark, BookmarkCheck, Clock, Video, ExternalLink } from 'lucide-react';
import { Wod } from '@/types/wod';
import StartWodButton from './StartWodButton';
import { getYouTubeEmbedUrl } from '@/utils/wodHelpers';

interface WodDetailProps {
  wod: Wod;
  onToggleFavorite: (wodId: string) => Promise<void>;
}

const WodDetail: React.FC<WodDetailProps> = ({ wod, onToggleFavorite }) => {
  // Add logging to debug video embedding
  console.log("WOD detail video URL:", wod.video_url);
  console.log("WOD detail video_demo:", wod.video_demo);
  const videoUrl = wod.video_url || wod.video_demo;
  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  console.log("Embed URL:", embedUrl);

  // Collect all part fields that have content
  const partFields = [
    wod.part_1, 
    wod.part_2, 
    wod.part_3, 
    wod.part_4, 
    wod.part_5, 
    wod.part_6, 
    wod.part_7, 
    wod.part_8, 
    wod.part_9, 
    wod.part_10
  ].filter(part => part && part.trim().length > 0);

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
        <div className="text-muted-foreground whitespace-pre-line">
          {wod.description}
        </div>
      )}
      
      {/* Video */}
      {videoUrl && (
        embedUrl ? (
          <div className="aspect-video rounded-lg overflow-hidden border">
            <iframe 
              width="100%" 
              height="100%" 
              src={embedUrl}
              title={`${wod.name} Demo`}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="rounded-lg bg-muted p-4 text-center">
            <Video className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p>Could not embed video. <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="underline text-primary flex items-center justify-center gap-1 hover:text-primary/80">
              Open video in new tab <ExternalLink className="h-4 w-4" />
            </a></p>
          </div>
        )
      )}
      
      {/* Components */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Workout Components</h2>
          <div className="space-y-4">
            {/* Structured components */}
            {wod.components.length > 0 && (
              <ul className="list-disc pl-5 space-y-3 mb-4">
                {wod.components
                  .sort((a, b) => a.order - b.order)
                  .map((component) => (
                    <li key={component.order} className="py-1">
                      <p className="whitespace-pre-line">{component.description}</p>
                    </li>
                  ))}
              </ul>
            )}

            {/* Additional parts from part_1 to part_10 */}
            {partFields.length > 0 && (
              <div className="space-y-3">
                {wod.components.length > 0 && (
                  <div className="border-t border-muted my-4"></div>
                )}
                <h3 className="font-medium text-md mt-2 mb-3">Additional Instructions</h3>
                <ul className="list-disc pl-5 space-y-3">
                  {wod.part_1 && (
                    <li className="py-1">
                      <p className="whitespace-pre-line">{wod.part_1}</p>
                    </li>
                  )}
                  {wod.part_2 && (
                    <li className="py-1">
                      <p className="whitespace-pre-line">{wod.part_2}</p>
                    </li>
                  )}
                  {wod.part_3 && (
                    <li className="py-1">
                      <p className="whitespace-pre-line">{wod.part_3}</p>
                    </li>
                  )}
                  {wod.part_4 && (
                    <li className="py-1">
                      <p className="whitespace-pre-line">{wod.part_4}</p>
                    </li>
                  )}
                  {wod.part_5 && (
                    <li className="py-1">
                      <p className="whitespace-pre-line">{wod.part_5}</p>
                    </li>
                  )}
                  {wod.part_6 && (
                    <li className="py-1">
                      <p className="whitespace-pre-line">{wod.part_6}</p>
                    </li>
                  )}
                  {wod.part_7 && (
                    <li className="py-1">
                      <p className="whitespace-pre-line">{wod.part_7}</p>
                    </li>
                  )}
                  {wod.part_8 && (
                    <li className="py-1">
                      <p className="whitespace-pre-line">{wod.part_8}</p>
                    </li>
                  )}
                  {wod.part_9 && (
                    <li className="py-1">
                      <p className="whitespace-pre-line">{wod.part_9}</p>
                    </li>
                  )}
                  {wod.part_10 && (
                    <li className="py-1">
                      <p className="whitespace-pre-line">{wod.part_10}</p>
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            {wod.components.length === 0 && partFields.length === 0 && wod.description ? (
              <p className="text-muted-foreground">See description above for workout details.</p>
            ) : wod.components.length === 0 && partFields.length === 0 ? (
              <p className="text-muted-foreground">No workout components available.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WodDetail;
