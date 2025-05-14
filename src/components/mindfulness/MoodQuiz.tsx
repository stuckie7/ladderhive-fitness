
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Clock, ActivitySquare, Brain, ChevronRight } from "lucide-react";

interface MoodQuizProps {
  moodOptions: {
    time: string[];
    intensity: string[];
    stressType: string[];
  };
  onComplete: (selections: { time: string; intensity: string; stressType: string }) => void;
  onDismiss: () => void;
}

export const MoodQuiz = ({ moodOptions, onComplete, onDismiss }: MoodQuizProps) => {
  const [step, setStep] = useState(0);
  const [time, setTime] = useState<string>("");
  const [intensity, setIntensity] = useState<string>("");
  const [stressType, setStressType] = useState<string>("");
  
  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onComplete({ time, intensity, stressType });
    }
  };
  
  const isStepComplete = () => {
    switch (step) {
      case 0:
        return !!time;
      case 1:
        return !!intensity;
      case 2:
        return !!stressType;
      default:
        return false;
    }
  };
  
  return (
    <Card className="w-full max-w-md p-6 bg-white dark:bg-gray-900 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">How are you feeling today?</h2>
        <Button variant="ghost" size="icon" onClick={onDismiss} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300"
          style={{ transform: `translateX(-${step * 100}%)` }}
        >
          {/* Step 1: Time */}
          <div className="min-w-full px-1">
            <h3 className="font-medium flex items-center mb-3">
              <Clock className="h-4 w-4 mr-2" /> How much time do you have?
            </h3>
            <div className="space-y-2">
              {moodOptions.time.map((option) => (
                <Button
                  key={option}
                  variant={time === option ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setTime(option)}
                >
                  {option === "quick" && "Just a few minutes (5-15 min)"}
                  {option === "medium" && "Some time (15-30 min)"}
                  {option === "extended" && "Plenty of time (30+ min)"}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Step 2: Intensity */}
          <div className="min-w-full px-1">
            <h3 className="font-medium flex items-center mb-3">
              <ActivitySquare className="h-4 w-4 mr-2" /> What intensity level feels right?
            </h3>
            <div className="space-y-2">
              {moodOptions.intensity.map((option) => (
                <Button
                  key={option}
                  variant={intensity === option ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setIntensity(option)}
                >
                  {option === "gentle" && "Gentle - Low intensity, calming"}
                  {option === "moderate" && "Moderate - Balanced energy"}
                  {option === "vigorous" && "Vigorous - Energizing, challenging"}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Step 3: Stress Type */}
          <div className="min-w-full px-1">
            <h3 className="font-medium flex items-center mb-3">
              <Brain className="h-4 w-4 mr-2" /> What are you looking to address?
            </h3>
            <div className="space-y-2">
              {moodOptions.stressType.map((option) => (
                <Button
                  key={option}
                  variant={stressType === option ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setStressType(option)}
                >
                  {option === "anxiety" && "Reduce anxiety or stress"}
                  {option === "focus" && "Improve focus and clarity"}
                  {option === "energy" && "Boost my energy levels"}
                  {option === "sleep" && "Prepare for better sleep"}
                  {option === "relaxation" && "Deep relaxation"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!isStepComplete()}
        >
          {step < 2 ? (
            <>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "Find My Practice"
          )}
        </Button>
      </div>
      
      <div className="flex justify-center mt-4">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className={`h-1.5 w-8 rounded-full ${i === step ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};
