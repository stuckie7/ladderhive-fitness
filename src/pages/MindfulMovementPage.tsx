
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Search, Leaf, Heart, Clock } from "lucide-react";
import { MoodQuiz } from "@/components/mindfulness/MoodQuiz";
import { BreathingAnimation } from "@/components/mindfulness/BreathingAnimation";
import { YogaWithBreathing } from "@/components/mindfulness/YogaWithBreathing";
import { useYogaMindfulMovements } from "@/hooks/use-yoga-mindful-movements";

const MindfulMovementPage = () => {
  const {
    workouts,
    isLoading,
    error,
    searchQuery,
    setSearchQuery
  } = useYogaMindfulMovements();
  
  const [showMoodQuiz, setShowMoodQuiz] = useState(false);
  const [daysOfPractice, setDaysOfPractice] = useState(0);
  const [showIntroBanner, setShowIntroBanner] = useState(true);
  
  // Load practice days from localStorage on component mount
  useEffect(() => {
    const savedDays = localStorage.getItem('mindful_practice_days');
    if (savedDays) {
      setDaysOfPractice(parseInt(savedDays, 10));
    }
  }, []);

  // Handle mood quiz completion
  const handleMoodQuizComplete = () => {
    setShowMoodQuiz(false);
  };

  // Record a day of practice
  const recordPracticeDay = () => {
    const newDays = daysOfPractice + 1;
    setDaysOfPractice(newDays);
    localStorage.setItem('mindful_practice_days', newDays.toString());
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8">
          <div className="relative mb-8 overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 p-8 text-white">
            <div className="absolute inset-0 bg-blue-600 opacity-30 animate-pulse" style={{ animationDuration: '6s' }}></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">Mindful Movement</h1>
                <p className="max-w-2xl opacity-90">
                  Take a moment to breathe, reset, and find inner calm through mindful movement practices. 
                  These sequences are designed to relieve stress and enhance your mental wellbeing.
                </p>
                
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => setShowMoodQuiz(true)}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Take Mood Quiz
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    View History
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white text-white hover:bg-blue-600"
                  >
                    Quick Relief Session
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <BreathingAnimation className="w-36 h-36" />
              </div>
            </div>
          </div>
          
          {showIntroBanner && (
            <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 mb-6">
              <div className="flex items-start gap-3">
                <Leaf className="h-5 w-5 text-green-600 dark:text-green-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium text-green-800 dark:text-green-300">Your Peaceful Practice Journey</h3>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Welcome to your digital sanctuary. Each practice you complete adds to your mindfulness streak. 
                    You've completed <span className="font-bold">{daysOfPractice} days</span> of peaceful practice so far.
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowIntroBanner(false)}
                  className="text-green-700 dark:text-green-400"
                >
                  Dismiss
                </Button>
              </div>
            </Card>
          )}
        </header>
        
        {showMoodQuiz && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <MoodQuiz 
              onComplete={handleMoodQuizComplete}
              onDismiss={() => setShowMoodQuiz(false)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div className="relative max-w-xl mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search poses, benefits..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Your Progress</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {daysOfPractice} days of peaceful practice
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-blue-300 dark:border-blue-700"
                onClick={recordPracticeDay}
              >
                Record Today's Practice
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 flex-1 bg-blue-200 dark:bg-blue-800 rounded-full">
                <div 
                  className="h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
                  style={{ width: `${Math.min((daysOfPractice / 30) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium">{daysOfPractice}/30</span>
            </div>
          </div>
          
          <div>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner className="h-8 w-8" />
              </div>
            ) : error ? (
              <Card className="p-4 bg-red-50 dark:bg-red-900/20 text-center">
                <p className="text-red-700 dark:text-red-300">
                  Error loading mindful movement practices. Please try again.
                </p>
              </Card>
            ) : workouts.length === 0 ? (
              <Card className="p-8 text-center bg-blue-50 dark:bg-blue-900/10">
                <h3 className="text-lg font-medium mb-2">No practices found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or search query to find mindful movement practices.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              </Card>
            ) : (
              <div>
                <h1 className="text-3xl font-bold mb-6">Mindful Movement</h1>
                
                <div className="mb-6">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search practices..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="w-full mt-8">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : error ? (
                <Card className="p-4 bg-red-50 dark:bg-red-900/20 text-center">
                  <p className="text-red-700 dark:text-red-300">
                    Error loading mindful movement practices. Please try again.
                  </p>
                </Card>
              ) : workouts.length === 0 ? (
                <Card className="p-8 text-center bg-blue-50 dark:bg-blue-900/10">
                  <h3 className="text-lg font-medium mb-2">No practices found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search query to find mindful movement practices.
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search
                  </Button>
                </Card>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Featured Mindful Movements</h2>
                  <div className="space-y-6">
                    {workouts.slice(0, 10).map((workout) => (
                      <YogaWithBreathing key={workout.id} workout={workout} />
                    ))}
                    
                    {workouts.length > 10 && (
                      <div className="text-center mt-8">
                        <Button>
                          Load More Practices
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MindfulMovementPage;
