import React from 'react';

const YouTubeInDepthDemo = () => {
  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 bg-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">In-Depth Walkthrough</h2>
      <div className="aspect-w-16 aspect-h-9 w-full bg-black rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/YOUR_IN_DEPTH_VIDEO_ID?autoplay=0"
          title="FitTrack Pro In-Depth Walkthrough"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
      <div className="mt-6 space-y-4">
        <h3 className="text-xl font-semibold">What's Covered:</h3>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Complete workout creation and tracking</li>
          <li>Exercise library and custom exercises</li>
          <li>Progress tracking and analytics</li>
          <li>Advanced features and settings</li>
        </ul>
      </div>
    </div>
  );
};

export default YouTubeInDepthDemo;
