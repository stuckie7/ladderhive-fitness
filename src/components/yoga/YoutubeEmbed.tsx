
import React from "react";

interface YoutubeEmbedProps {
  url?: string | null;
  title: string;
  className?: string;
}

export const YoutubeEmbed = ({ url, title, className = "w-full h-48" }: YoutubeEmbedProps) => {
  if (!url) return null;
  
  // Extract video ID from URL
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getVideoId(url);

  if (!videoId) return <a href={url} className="text-blue-500 hover:underline">{title}</a>;

  return (
    <div className="relative overflow-hidden rounded-lg">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`${className} rounded-lg`}
      />
    </div>
  );
};
