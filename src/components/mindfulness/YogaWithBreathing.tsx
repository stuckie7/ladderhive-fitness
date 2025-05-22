
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, ActivitySquare, Brain, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Helper function to get YouTube embed URL
const getYoutubeEmbedUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1].split(/[?&#]/)[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
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
  const navigate = useNavigate();
  const embedUrl = getYoutubeEmbedUrl(workout.videoUrl);
  
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
          {workout.thumbnailUrl ? (
            <img 
              src={workout.thumbnailUrl} 
              alt={workout.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
              <ActivitySquare className="h-12 w-12 text-blue-500 dark:text-blue-300" />
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
