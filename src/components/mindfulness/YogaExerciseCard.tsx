
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play } from "lucide-react";
import VideoEmbed from "@/components/workouts/detail/VideoEmbed";

interface YogaExerciseProps {
  title: string;
  description: string;
  shortDemoUrl: string;
  fullTutorialUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  benefits?: string[];
}

const YogaExerciseCard = ({
  title,
  description,
  shortDemoUrl,
  fullTutorialUrl,
  thumbnailUrl,
  duration,
  benefits = [],
}: YogaExerciseProps) => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 pb-2">
        <CardTitle className="text-xl font-semibold text-blue-900 dark:text-blue-100">
          {title}
        </CardTitle>
        {duration && (
          <CardDescription className="text-blue-700 dark:text-blue-300">
            {duration}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="pt-4 space-y-4">
        {!showVideo ? (
          <div 
            className="relative aspect-video bg-muted rounded-md overflow-hidden cursor-pointer group"
            onClick={() => setShowVideo(true)}
          >
            {thumbnailUrl && (
              <img 
                src={thumbnailUrl} 
                alt={`${title} preview`}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <div className="bg-blue-500/90 rounded-full p-3 transition-transform group-hover:scale-110">
                <Play className="h-8 w-8 text-white" fill="white" />
              </div>
            </div>
          </div>
        ) : (
          <VideoEmbed videoUrl={shortDemoUrl} />
        )}

        <div className="text-sm text-muted-foreground">
          <p className="mb-2">{description}</p>
          
          {benefits.length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium text-foreground mb-1">Benefits:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/30 pt-3">
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => window.open(fullTutorialUrl, '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" /> 
          Watch Full Tutorial
        </Button>
      </CardFooter>
    </Card>
  );
};

export default YogaExerciseCard;
