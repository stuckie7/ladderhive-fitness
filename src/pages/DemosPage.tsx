import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { YouTubeShortDemo, YouTubeInDepthDemo } from '@/components/demos';

const DemosPage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">FitTrack Pro Demos</h1>
        <div className="space-y-12">
          <YouTubeShortDemo />
          <YouTubeInDepthDemo />
        </div>
      </div>
    </AppLayout>
  );
};

export default DemosPage;
