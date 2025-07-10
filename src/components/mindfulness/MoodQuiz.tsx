import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface MoodQuizProps {
  onComplete: () => void;
  onDismiss: () => void;
}

export const MoodQuiz = ({ onComplete, onDismiss }: MoodQuizProps) => {
  const [selectedMood, setSelectedMood] = useState<string>("");
  
  const moodOptions = [
    { emoji: "😊", label: "Calm and relaxed" },
    { emoji: "😌", label: "A bit stressed" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "😟", label: "Anxious" },
    { emoji: "😔", label: "Tired" },
  ];
  
  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    setTimeout(() => {
      onComplete();
    }, 500);
  };
  
  return (
    <Card className="w-full max-w-md p-6 bg-white dark:bg-gray-900 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">How are you feeling today?</h2>
        <Button variant="ghost" size="icon" onClick={onDismiss} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        {moodOptions.map((option) => (
          <Button
            key={option.label}
            variant={selectedMood === option.label ? "default" : "outline"}
            className="w-full justify-start text-lg py-6"
            onClick={() => handleMoodSelect(option.label)}
          >
            <span className="text-2xl mr-3">{option.emoji}</span>
            {option.label}
          </Button>
        ))}
      </div>
    </Card>
  );
};
