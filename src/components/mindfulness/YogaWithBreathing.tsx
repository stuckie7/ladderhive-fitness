
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, ActivitySquare, Brain, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Helper function to extract YouTube video ID
const getYoutubeId = (url: string | undefined): string | null => {
  if (!url) return null;
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1].split(/[?&#]/)[0];
  }
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
};

// Helper function to get YouTube thumbnail URL
const getYoutubeThumbnail = (url: string | undefined, quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault' = 'hqdefault'): string | null => {
  const videoId = getYoutubeId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/${quality}.jpg` : null;
};

// Helper function to get YouTube embed URL
const getYoutubeEmbedUrl = (url: string | undefined): string | null => {
  const videoId = getYoutubeId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
};

interface Workout {
  id: string;
  title: string;
  description: string;
  duration: string;
  intensity: string;
  timeNeeded: string;
  stressType: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

interface YogaWithBreathingProps {
  workout: Workout;
}

export const YogaWithBreathing = ({ workout }: YogaWithBreathingProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const videoId = getYoutubeId(workout.videoUrl);
  const embedUrl = getYoutubeEmbedUrl(workout.videoUrl);
  const thumbnailUrl = workout.thumbnailUrl || getYoutubeThumbnail(workout.videoUrl, 'hqdefault');
  
  const handleStartPractice = () => {
    if (workout.videoUrl) {
      setShowVideo(true);
    } else {
      navigate(`/yoga/${workout.id}`);
    }
  };
  
  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (workout.videoUrl) {
      setShowVideo(true);
    }
  }; 
  
  const handleCloseVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVideo(false);
  }; 
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowVideo(false);
    }
  };
  
  return (
    <Card 
      className="overflow-hidden transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 h-full">
        <div className="relative h-48 md:h-full md:col-span-1 overflow-hidden">
          {thumbnailUrl && !imageError ? (
            <div className="w-full h-full relative">
              <img 
                src={thumbnailUrl}
                alt={workout.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
              {videoId && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 rounded-full p-3">
                    <Play className="h-8 w-8 text-white" fill="currentColor" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/50 p-4 text-center">
              <ActivitySquare className="h-12 w-12 text-blue-400 dark:text-blue-300 mb-2" />
              <span className="text-sm text-blue-600 dark:text-blue-300 font-medium">
                {workout.title}
              </span>
            </div>
          )}
          
          {workout.videoUrl && isHovered && (
            <div 
              className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity cursor-pointer"
              onClick={handleVideoClick}
            >
              <Button 
                variant="default"
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVideo(true);
                }}
              >
                <Play className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="p-5 md:col-span-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{workout.title}</h3>
            <Badge>{workout.duration}</Badge>
          </div>
          
          <p className="text-muted-foreground my-3">{workout.description}</p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span className="capitalize">{workout.timeNeeded}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <ActivitySquare className="h-4 w-4 mr-1" />
              <span className="capitalize">{workout.intensity}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Brain className="h-4 w-4 mr-1" />
              <span className="capitalize">{workout.stressType}</span>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={handleStartPractice}>
              Start Practice
            </Button>
          </div>
        </div>
      </div>
      
      {/* Video Modal */}
      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-2 -top-2 z-10 h-8 w-8 rounded-full bg-gray-800/80 text-white hover:bg-gray-700/90"
              onClick={handleCloseVideo}
            >
              <X className="h-4 w-4" />
            </Button>
            {embedUrl ? (
              <div className="aspect-video w-full">
                <iframe
                  src={embedUrl}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">Video not available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
