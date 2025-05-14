
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { YogaWorkout } from "@/hooks/use-yoga-workouts";
import { YoutubeEmbed } from "@/components/yoga/YoutubeEmbed";
import { BreathingAnimation } from "./BreathingAnimation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface YogaWithBreathingProps {
  workout: YogaWorkout;
}

export const YogaWithBreathing = ({ workout }: YogaWithBreathingProps) => {
  const [showBenefits, setShowBenefits] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  
  // Sample benefits based on body region and muscle groups
  const getBenefits = () => {
    const benefits: string[] = [];
    
    if (workout.body_region?.includes("Core")) {
      benefits.push("Improves concentration and focus by engaging the core");
    }
    
    if (workout.body_region?.includes("Upper")) {
      benefits.push("Releases tension in the shoulders and neck, reducing stress");
    }
    
    if (workout.body_region?.includes("Lower")) {
      benefits.push("Grounds energy and creates stability, helping reduce anxiety");
    }
    
    if (workout.prime_mover_muscle?.includes("Hip")) {
      benefits.push("Opens hip flexors where we store stress and emotional tension");
    }
    
    if (workout.difficulty === "Beginner") {
      benefits.push("Perfect for beginners to develop mindful awareness");
    } else if (workout.difficulty === "Advanced") {
      benefits.push("Builds mental resilience through challenging postures");
    }
    
    // Add some default benefits if we don't have specific ones
    if (benefits.length === 0) {
      benefits.push(
        "Reduces stress by activating the parasympathetic nervous system",
        "Improves focus and mental clarity through mindful movement",
        "Enhances mind-body connection through coordinated breath and movement"
      );
    }
    
    return benefits;
  };
  
  const ambientSounds = [
    { id: "forest", name: "Forest Sounds" },
    { id: "rain", name: "Gentle Rain" },
    { id: "bowls", name: "Singing Bowls" },
    { id: "ocean", name: "Ocean Waves" }
  ];
  
  const toggleSound = (soundId: string) => {
    if (selectedSound === soundId) {
      setSelectedSound(null);
      setSoundOn(false);
    } else {
      setSelectedSound(soundId);
      setSoundOn(true);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:flex-1">
            <h3 className="text-lg font-semibold mb-2">{workout.name}</h3>
            
            {workout.short_youtube_demo && (
              <div className="relative rounded-md overflow-hidden">
                <YoutubeEmbed 
                  url={workout.short_youtube_demo} 
                  title={workout.name} 
                  className="aspect-video w-full"
                />
              </div>
            )}
            
            <div className="flex justify-between items-center mt-3">
              {workout.difficulty && (
                <span className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  {workout.difficulty}
                </span>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBenefits(!showBenefits)}
                className="text-sm border-blue-200 dark:border-blue-800"
              >
                {showBenefits ? "Hide Benefits" : "How This Helps"}
              </Button>
            </div>
            
            {showBenefits && (
              <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-300">Mental & Physical Benefits</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {getBenefits().map((benefit, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="md:w-1/3 flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Breathing Guide</h4>
            <BreathingAnimation className="w-28 h-28 mb-4" />
            
            <div className="w-full">
              <p className="text-sm text-center mb-3">Ambient Sound</p>
              <div className="flex flex-wrap justify-center gap-2">
                {ambientSounds.map((sound) => (
                  <TooltipProvider key={sound.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className={`p-2 rounded-md ${
                            selectedSound === sound.id 
                              ? "bg-blue-200 dark:bg-blue-700" 
                              : "bg-white dark:bg-gray-800"
                          }`}
                          onClick={() => toggleSound(sound.id)}
                        >
                          {selectedSound === sound.id ? (
                            <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                          ) : (
                            <VolumeX className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{sound.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {workout.in_depth_youtube_exp && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Detailed Tutorial</h4>
            <YoutubeEmbed 
              url={workout.in_depth_youtube_exp} 
              title={`${workout.name} Tutorial`}
              className="aspect-video w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
