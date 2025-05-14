
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoodType, TimeFilter, IntensityFilter, StressTypeFilter } from "@/hooks/use-mindful-movement";

interface MoodQuizProps {
  moodOptions: MoodType[];
  onComplete: (filters: { 
    time: TimeFilter; 
    intensity: IntensityFilter; 
    stressType: StressTypeFilter 
  }) => void;
  onDismiss: () => void;
}

export const MoodQuiz = ({ moodOptions, onComplete, onDismiss }: MoodQuizProps) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  
  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
  };
  
  const handleComplete = () => {
    if (!selectedMood) return;
    
    // Map mood recommendations to filters
    const time = selectedMood.recommendedSequences[0] as TimeFilter;
    const intensity = selectedMood.recommendedSequences[1] as IntensityFilter;
    const stressType = selectedMood.recommendedSequences[2] as StressTypeFilter;
    
    onComplete({ time, intensity, stressType });
  };
  
  return (
    <Card className="bg-white dark:bg-gray-900 shadow-xl rounded-lg max-w-md w-full p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">How are you feeling today?</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Let us recommend the perfect mindful movement practice for your current state
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3 mb-6">
        {moodOptions.map((mood) => (
          <Button
            key={mood.id}
            variant={selectedMood?.id === mood.id ? "default" : "outline"}
            className={`justify-start px-4 py-6 h-auto transition-all ${
              selectedMood?.id === mood.id
                ? "bg-blue-500 text-white border-blue-500"
                : "hover:bg-blue-50 dark:hover:bg-blue-950/30"
            }`}
            onClick={() => handleMoodSelect(mood)}
          >
            <div className="text-left">
              <div className="font-medium">{mood.name}</div>
              <div className={`text-sm mt-1 ${selectedMood?.id === mood.id ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>
                {mood.description}
              </div>
            </div>
          </Button>
        ))}
      </div>
      
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onDismiss}>
          Cancel
        </Button>
        <Button 
          onClick={handleComplete} 
          disabled={!selectedMood}
        >
          Find Practices
        </Button>
      </div>
    </Card>
  );
};
