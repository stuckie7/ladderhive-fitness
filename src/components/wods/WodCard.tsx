
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Bookmark, BookmarkCheck, Video, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Wod } from '@/types/wod';
import { getYouTubeThumbnail, createDescriptionSnippet, generateEngagingDescription } from '@/utils/wodHelpers';

interface WodCardProps {
  wod: Wod;
  onToggleFavorite: (wodId: string) => Promise<void>;
}

const WodCard: React.FC<WodCardProps> = ({ wod, onToggleFavorite }) => {
  const navigate = useNavigate();
  // Add logging to debug video URL and thumbnail generation
  console.log(`WOD ${wod.id} video URL:`, wod.video_url);
  const thumbnailUrl = getYouTubeThumbnail(wod.video_url);
  console.log(`WOD ${wod.id} thumbnail URL:`, thumbnailUrl);
  // Generate an engaging description or use the existing one
  const descriptionText = wod.description ? createDescriptionSnippet(wod.description, 120) : generateEngagingDescription(wod);
  const hasVideo = !!wod.video_url;

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

  const handleViewDetails = () => {
    navigate(`/wods/${wod.id}`);
  };

  const handleStartWorkout = () => {
    navigate(`/workout-builder?wod=${wod.id}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onToggleFavorite(wod.id);
  };

  return (
    <Card 
      className="h-full flex flex-col hover:shadow-md transition-shadow transform hover:scale-[1.01] overflow-hidden relative"
      onClick={handleViewDetails}
    >
      {thumbnailUrl && (
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"
            aria-hidden="true"
          />
          <img 
            src={thumbnailUrl} 
            alt={`${wod.name} thumbnail`}
            className="w-full h-full object-cover opacity-70"
            onError={(e) => {
              // Handle image loading errors by adding a class to hide the broken image
              e.currentTarget.classList.add('hidden');
              console.error(`Failed to load thumbnail for WOD ${wod.id}`);
            }}
          />
        </div>
      )}
      
      <CardHeader className={`pb-2 relative z-10 ${thumbnailUrl ? 'text-white' : ''}`}>
        <div className="flex justify-between">
          <CardTitle className="text-xl">{wod.name}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            className={wod.is_favorite ? "text-amber-500" : thumbnailUrl ? "text-white" : ""}
          >
            {wod.is_favorite ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
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
        </div>
      </CardHeader>
      
      <CardContent className={`flex-grow relative z-10 ${thumbnailUrl ? 'text-white' : ''}`}>
        <p className={`text-sm mb-4 ${thumbnailUrl ? 'text-white/80' : 'text-muted-foreground'}`}>
          {descriptionText}
        </p>
        
        <div className={`flex items-center gap-2 text-sm ${thumbnailUrl ? 'text-white/70' : 'text-muted-foreground'}`}>
          {wod.avg_duration_minutes && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{wod.avg_duration_minutes} min</span>
            </div>
          )}
          
          {hasVideo && (
            <div className="flex items-center">
              <Video className="h-4 w-4 mr-1" />
              <span>Video demo</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 relative z-10">
        <div className="flex gap-2 w-full">
          <Button 
            variant={thumbnailUrl ? "secondary" : "outline"}
            onClick={(e) => { e.stopPropagation(); handleViewDetails(); }}
            className="flex-1"
          >
            View Details
          </Button>
          <Button 
            className="flex-1 bg-fitness-primary hover:bg-fitness-primary/90"
            onClick={(e) => { e.stopPropagation(); handleStartWorkout(); }}
          >
            <Play className="mr-2 h-4 w-4" /> 
            Start
          </Button>
        </div>
      </CardFooter>
      
      {hasVideo && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    bg-fitness-primary/80 rounded-full p-3 z-10 opacity-80 hover:opacity-100"
        >
          <Play className="h-6 w-6 text-white" />
        </div>
      )}
    </Card>
  );
};

export default WodCard;
