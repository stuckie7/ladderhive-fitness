// components/exercises/ExerciseVideoHandler.tsx
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return '';
  const videoId = url.split('v=')[1]?.split('&')[0];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
};

export default function ExerciseVideoHandler({
  demoUrl,
  explanationUrl
}: {
  demoUrl?: string;
  explanationUrl?: string;
}) {
  const hasDemo = !!demoUrl;
  const hasExplanation = !!explanationUrl;

  if (!hasDemo && !hasExplanation) {
    return <p className="text-gray-500 italic">No video available</p>;
  }

  return (
    <Tabs defaultValue={hasDemo ? "demo" : "explanation"} className="w-full mb-6">
      <TabsList>
        {hasDemo && <TabsTrigger value="demo">Demo</TabsTrigger>}
        {hasExplanation && <TabsTrigger value="explanation">Explanation</TabsTrigger>}
      </TabsList>

      {hasDemo && (
        <TabsContent value="demo">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              className="w-full h-full rounded-lg"
              src={getYouTubeEmbedUrl(demoUrl!)}
              title="Demo Video"
              allowFullScreen
            />
          </div>
        </TabsContent>
      )}

      {hasExplanation && (
        <TabsContent value="explanation">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              className="w-full h-full rounded-lg"
              src={getYouTubeEmbedUrl(explanationUrl!)}
              title="Explanation Video"
              allowFullScreen
            />
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
