
import React, { useState } from "react";
import { MoodType, TimeFilter, IntensityFilter, StressTypeFilter } from "@/hooks/use-mindful-movement";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ArrowRight, X } from "lucide-react";

interface MoodQuizProps {
  moodOptions: MoodType[];
  onComplete: (filters: {
    time: TimeFilter;
    intensity: IntensityFilter;
    stressType: StressTypeFilter;
  }) => void;
  onDismiss: () => void;
}

export const MoodQuiz = ({ moodOptions, onComplete, onDismiss }: MoodQuizProps) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
  };

  const handleComplete = () => {
    if (!selectedMood) {
      toast({
        title: "Please select an option",
        description: "Tell us how you're feeling so we can recommend the right practice",
      });
      return;
    }

    const [time, intensity, stressType] = selectedMood.recommendedSequences as [
      TimeFilter,
      IntensityFilter,
      StressTypeFilter
    ];

    onComplete({
      time,
      intensity,
      stressType,
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-blue-50 dark:bg-blue-900/20">
      <CardHeader className="relative pb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onDismiss}
          className="absolute right-2 top-2"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardTitle className="text-xl text-blue-800 dark:text-blue-300">How are you feeling today?</CardTitle>
        <CardDescription>
          Let us recommend a mindful practice tailored to your current state
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {moodOptions.map((mood) => (
            <button
              key={mood.id}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedMood?.id === mood.id
                  ? "border-blue-500 bg-blue-100 dark:bg-blue-800/40"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
              }`}
              onClick={() => handleMoodSelect(mood)}
            >
              <h3 className="font-medium mb-1">{mood.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{mood.description}</p>
            </button>
          ))}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleComplete}
        >
          Find My Practice <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
