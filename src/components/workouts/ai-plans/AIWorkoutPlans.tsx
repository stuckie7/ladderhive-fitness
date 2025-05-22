
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Exercise } from '@/types/exercise'; // Import from types directly
import { Loader2 } from "lucide-react";
import ExerciseVideoHandler from '@/components/exercises/ExerciseVideoHandler';

// Define the custom hook interface
interface AIWorkoutPlanHook {
  generateWorkout: (goal: string, duration: number, difficulty: string) => Promise<void>;
  workout: any | null;
  loading: boolean;
}

// Define difficulty type
type DifficultyLevel = "beginner" | "intermediate" | "advanced";

const AIWorkoutPlans = () => {
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('30');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  
  // Mock implementation for the hook since we don't have the actual implementation
  const useAIWorkoutPlans = (): AIWorkoutPlanHook => {
    const [workout, setWorkout] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    
    const generateWorkout = async (goal: string, duration: number, difficulty: string) => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setWorkout({
          title: `${difficulty} ${goal} Workout`,
          description: `A ${duration} minute workout focused on ${goal}`,
          duration_minutes: duration,
          difficulty: difficulty,
          exercises: [
            {
              id: "1",
              name: "Push-up",
              sets: 3,
              reps: "10",
              rest_seconds: 60,
              notes: "Focus on form",
              video_url: "https://www.youtube.com/watch?v=IODxDxX7oi4"
            }
          ]
        });
        setLoading(false);
      }, 1000);
    };
    
    return { generateWorkout, workout, loading };
  };
  
  const { generateWorkout, workout, loading } = useAIWorkoutPlans();

  const handleGenerateWorkout = async () => {
    await generateWorkout(goal, parseInt(duration, 10), difficulty);
  };

  // Helper to convert string difficulty to DifficultyLevel
  const safeDifficulty = (value: string): DifficultyLevel => {
    const validValues: DifficultyLevel[] = ["beginner", "intermediate", "advanced"];
    if (validValues.includes(value as DifficultyLevel)) {
      return value as DifficultyLevel;
    }
    return "intermediate"; // Default fallback
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">AI Workout Generator</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Your Workout</CardTitle>
          <CardDescription>
            Tell us your fitness goals and we'll design a customized workout plan for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <label htmlFor="goal" className="block text-sm font-medium mb-1">
                Your Goal
              </label>
              <Input
                id="goal"
                placeholder="e.g., Build muscle, lose weight, improve cardio"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-sm font-medium mb-1">
                Duration (minutes)
              </label>
              <Input
                id="duration"
                type="number"
                min="10"
                max="120"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium mb-1">
                Difficulty Level
              </label>
              <Select 
                value={difficulty} 
                onValueChange={(value) => setDifficulty(safeDifficulty(value))}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleGenerateWorkout} 
              disabled={loading || !goal} 
              className="mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Workout Plan'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {workout && (
        <Card>
          <CardHeader>
            <CardTitle>{workout.title}</CardTitle>
            <CardDescription>
              {workout.difficulty} level • {workout.duration_minutes} minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{workout.description}</p>
            
            <h3 className="text-lg font-medium mb-2">Exercises</h3>
            <div className="space-y-4">
              {workout.exercises.map((exercise: any, index: number) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-md font-medium">{exercise.name}</h4>
                    {exercise.video_url && (
                      <ExerciseVideoHandler
                        exercise={exercise as Exercise}
                        title={exercise.name}
                        className="mt-0"
                        url={exercise.video_url}
                      />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                    <div>
                      <span className="font-medium">Sets:</span> {exercise.sets}
                    </div>
                    <div>
                      <span className="font-medium">Reps:</span> {exercise.reps}
                    </div>
                    <div>
                      <span className="font-medium">Rest:</span> {exercise.rest_seconds}s
                    </div>
                  </div>
                  
                  {exercise.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{exercise.notes}</p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Select 
                defaultValue={difficulty} 
                onValueChange={(value) => setDifficulty(safeDifficulty(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Change difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={handleGenerateWorkout} 
                disabled={loading} 
                className="ml-2"
              >
                Regenerate
              </Button>
              
              <Button className="ml-2">
                Save Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIWorkoutPlans;
