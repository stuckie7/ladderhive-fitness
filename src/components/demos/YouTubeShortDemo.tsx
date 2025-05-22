import React from 'react';

const YouTubeShortDemo = () => {
  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-4 bg-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Quick Demo</h2>
      <div className="aspect-w-9 aspect-h-16 w-full bg-black rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/YOUR_SHORT_VIDEO_ID?autoplay=0&mute=1"
          title="FitTrack Pro Quick Demo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
      <p className="mt-4 text-sm text-muted-foreground text-center">
        A quick 30-second overview of FitTrack Pro's key features
      </p>
    </div>
  );
};

export default YouTubeShortDemo;
