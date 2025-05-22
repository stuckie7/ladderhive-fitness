import { useState } from 'react';
import { Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoThumbnailProps {
  thumbnailUrl: string;
  videoUrl: string;
  title: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function VideoThumbnail({ 
  thumbnailUrl, 
  videoUrl, 
  title, 
  className = '',
  size = 'md'
}: VideoThumbnailProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
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
        return `https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1&origin=${window.location.origin}`;
      }
      
      return url;
    } catch (error) {
      console.error('Error parsing video URL:', url, error);
      return '';
    }
  };

  const embedUrl = getEmbedUrl(videoUrl);
  const hasVideo = !!videoUrl;

  if (!hasVideo) return null;

  return (
    <>
      <div 
        className={`relative rounded-md overflow-hidden cursor-pointer transition-all duration-200 transform hover:scale-105 ${sizeClasses[size]} ${className}`}
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img 
          src={thumbnailUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-80'}`}>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
            <Play className="h-6 w-6 text-primary fill-primary" />
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
