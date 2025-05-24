
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Bookmark, BookmarkCheck, Video, Play, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Wod } from '@/types/wod';
import { getYouTubeThumbnail, createDescriptionSnippet, generateEngagingDescription } from '@/utils/wodHelpers';

interface WodCardProps {
  wod: Wod;
  onToggleFavorite: (wodId: string) => Promise<void>;
  isFavorite?: boolean;
}

const WodCard: React.FC<WodCardProps> = ({ wod, onToggleFavorite, isFavorite: isInitiallyFavorite = false }) => {
  const [isFavorite, setIsFavorite] = useState(isInitiallyFavorite);
  
  // Update local state when prop changes
  useEffect(() => {
    setIsFavorite(isInitiallyFavorite);
  }, [isInitiallyFavorite]);
  
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onToggleFavorite(wod.id);
      setIsFavorite(prev => !prev);
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error toggling favorite:', error);
    }
  };
  const navigate = useNavigate();
  // Add logging to debug video URL and thumbnail generation
  console.log(`WOD ${wod.id} video URL:`, wod.video_url);
  const thumbnailUrl = getYouTubeThumbnail(wod.video_url);
  console.log(`WOD ${wod.id} thumbnail URL:`, thumbnailUrl);
  // Generate an engaging description or use the existing one
  const descriptionText = wod.description ? createDescriptionSnippet(wod.description, 120) : generateEngagingDescription(wod);
  const hasVideo = !!wod.video_url;
  
  // Use default image for saved workouts or when no thumbnail is available
  const defaultThumbnail = '/fitapp%20icon%2048x48.jpg';

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

  const handleStartWorkout = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/workout-builder?wod=${wod.id}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onToggleFavorite(wod.id);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wod.video_url) {
      // Open video in a new tab
      window.open(wod.video_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card 
      className="h-full flex flex-col hover:shadow-md transition-shadow transform hover:scale-[1.01] overflow-hidden relative group"
      onClick={handleViewDetails}
    >
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"
          aria-hidden="true"
        />
        <div 
          className="relative w-full h-full cursor-pointer"
          onClick={handleVideoClick}
        >
          {thumbnailUrl ? (
            <>
              <img 
                src={thumbnailUrl} 
                alt={`${wod.name} thumbnail`}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-200"
                onError={(e) => {
                  // Fallback to default image on error
                  const img = e.target as HTMLImageElement;
                  img.src = defaultThumbnail;
                  img.onerror = null; // Prevent infinite loop if default image fails
                }}
              />
              {wod.video_url && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-black/50 rounded-full p-4">
                    <Play className="h-12 w-12 text-white" fill="white" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
              <img 
                src={defaultThumbnail} 
                alt="Default workout thumbnail"
                className="w-full h-full object-cover opacity-70"
              />
            </div>
          )}
        </div>
      </div>
      
      <CardHeader className={`pb-2 relative z-10 ${thumbnailUrl ? 'text-white' : ''}`}>
        <div className="flex justify-between">
          <CardTitle className="text-xl">{wod.name}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            className={wod.is_favorite ? "text-amber-500 hover:bg-transparent hover:text-amber-600" : thumbnailUrl ? "text-white hover:bg-white/10" : ""}
          >
            {wod.is_favorite ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
            <span className="sr-only">
              {wod.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            </span>
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
      
      <CardFooter className="relative z-10 pt-4">
        <div className="w-full flex gap-2">
          <Button 
            variant="secondary" 
            className="flex-1"
            onClick={handleViewDetails}
            aria-label="View workout details"
          >
            View Details
          </Button>
          <Button 
            variant={hasVideo ? "default" : "outline"}
            className="flex-1 gap-2"
            onClick={handleStartWorkout}
            aria-label={hasVideo ? "Start workout with video" : "View workout details"}
          >
            {hasVideo ? (
              <>
                <Play className="h-4 w-4" />
                Start Workout
              </>
            ) : (
              <>
                <Dumbbell className="h-4 w-4" />
                View Workout
              </>
            )}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? (
            <BookmarkCheck className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </Button>
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
