
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Bookmark, BookmarkCheck, Video, Play, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Wod } from '@/types/wod';
import { getYouTubeThumbnail, getYouTubeVideoId, createDescriptionSnippet, generateEngagingDescription } from '@/utils/wodHelpers';

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
  // Get the best available video URL (prefer video_url, fall back to video_demo)
  const videoUrl = wod.video_url || (wod as any).video_demo;
  
  // State for thumbnail handling
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = React.useState(false);
  
  // Handle thumbnail loading and errors
  React.useEffect(() => {
    if (videoUrl) {
      // First try to get the highest quality thumbnail
      const url = getYouTubeThumbnail(videoUrl);
      setThumbnailUrl(url);
      setThumbnailError(false);
    } else if (wod.image_url) {
      // Fall back to image_url if no video URL is available
      setThumbnailUrl(wod.image_url);
      setThumbnailError(false);
    } else {
      setThumbnailUrl(null);
    }
  }, [videoUrl, wod.image_url]);

  // Generate an engaging description or use the existing one
  const descriptionText = wod.description ? createDescriptionSnippet(wod.description, 120) : generateEngagingDescription(wod);
  const hasVideo = !!videoUrl;
  
  // Default thumbnail for when no video thumbnail is available
  const defaultThumbnail = '/fitapp%20icon%2048x48.jpg';
  const displayThumbnail = thumbnailError || !thumbnailUrl ? defaultThumbnail : thumbnailUrl;

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
    navigate(`/workout-player/${wod.id}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onToggleFavorite(wod.id);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoUrl) {
      // Open video in a new tab
      window.open(videoUrl, '_blank', 'noopener,noreferrer');
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
          <img 
            src={displayThumbnail} 
            alt={`${wod.name} thumbnail`}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-200"
            onError={(e) => {
              // Fallback to lower quality thumbnails on error
              const img = e.target as HTMLImageElement;
              if (videoUrl) {
                // Try different YouTube thumbnail qualities
                const videoId = getYouTubeVideoId(videoUrl);
                if (videoId) {
                  // Try lower quality thumbnails in order of preference
                  const qualities = ['maxresdefault.jpg', 'hqdefault.jpg', 'mqdefault.jpg', 'default.jpg'];
                  const currentSrc = img.src.split('/').pop() || '';
                  const currentQualityIndex = qualities.findIndex(q => currentSrc.includes(q));
                  
                  if (currentQualityIndex < qualities.length - 1) {
                    // Try next lower quality
                    img.src = `https://img.youtube.com/vi/${videoId}/${qualities[currentQualityIndex + 1]}`;
                  } else if (wod.image_url) {
                    // Fall back to image_url if available
                    img.src = wod.image_url;
                  } else {
                    // Final fallback to default thumbnail
                    img.src = defaultThumbnail;
                    setThumbnailError(true);
                  }
                } else if (wod.image_url) {
                  // If we can't get a video ID but have an image URL, use that
                  img.src = wod.image_url;
                } else {
                  // Final fallback to default thumbnail
                  img.src = defaultThumbnail;
                  setThumbnailError(true);
                }
              } else if (wod.image_url) {
                // If no video URL but we have an image URL, use that
                img.src = wod.image_url;
              } else {
                // Final fallback to default thumbnail
                img.src = defaultThumbnail;
                setThumbnailError(true);
              }
              img.onerror = null; // Prevent infinite loop
            }}
            loading="lazy"
          />
          {hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-black/50 rounded-full p-3">
                <Play className="h-8 w-8 text-white" />
              </div>
            </div>
          )}
          {!hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
              <Dumbbell className="h-12 w-12 text-gray-400" />
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
      
      <CardContent className={`flex-grow relative z-10 ${thumbnailUrl ? 'text-white' : ''} space-y-3`}>
        <div className="space-y-2">
          <p className={`text-sm ${thumbnailUrl ? 'text-white/80' : 'text-muted-foreground'}`}>
            {descriptionText}
          </p>
          
          {/* Display parts if they exist */}
          {[wod.part_1, wod.part_2, wod.part_3, wod.part_4, wod.part_5, wod.part_6, wod.part_7, wod.part_8, wod.part_9, wod.part_10]
            .filter(part => part && part.trim() !== '')
            .map((part, index) => (
              <div key={index} className="flex items-start">
                <span className="inline-block w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5">
                  {index + 1}
                </span>
                <p className={`text-sm flex-1 ${thumbnailUrl ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {part}
                </p>
              </div>
            ))}
        </div>
        
        <div className={`flex flex-wrap items-center gap-3 text-sm ${thumbnailUrl ? 'text-white/70' : 'text-muted-foreground'} pt-2 border-t border-white/10`}>
          {wod.avg_duration_minutes > 0 && (
            <div className="flex items-center bg-white/10 px-2 py-1 rounded-md">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              <span>{wod.avg_duration_minutes} min</span>
            </div>
          )}
          
          {hasVideo && (
            <div className="flex items-center bg-white/10 px-2 py-1 rounded-md">
              <Video className="h-3.5 w-3.5 mr-1.5" />
              <span>Video demo</span>
            </div>
          )}
          
          {wod.components && Object.keys(wod.components).length > 0 && (
            <div className="flex items-center bg-white/10 px-2 py-1 rounded-md">
              <Dumbbell className="h-3.5 w-3.5 mr-1.5" />
              <span>{Object.keys(wod.components).length} components</span>
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
