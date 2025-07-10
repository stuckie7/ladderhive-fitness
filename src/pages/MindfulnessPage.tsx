
import React, { useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import YogaExerciseCard from "@/components/mindfulness/YogaExerciseCard";
import YogaRoutineCard from "@/components/mindfulness/YogaRoutineCard";
import yogaExercises from "@/data/yoga-exercises";
import yogaRoutines from "@/data/yoga-routines";

const MindfulnessPage: React.FC = () => {
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    // Apply some subtle animations using CSS classes
    const element = document.getElementById('mindfulness-content');
    if (element) {
      element.classList.add('animate-fade-in');
    }
  }, []);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6" id="mindfulness-content">
        <header className="mb-8">
          <div className="relative mb-8 overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 p-8 text-white">
            <div className="absolute inset-0 bg-blue-600 opacity-30 animate-pulse" style={{ animationDuration: '6s' }}></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Mindfulness & Stress Relief</h1>
              <p className="max-w-2xl opacity-90">
                Welcome to your peaceful sanctuary. These yoga exercises and routines are designed to help you reduce stress, 
                improve focus, and cultivate mindfulness in your daily life.
              </p>
            </div>
          </div>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-blue-800 dark:text-blue-300">Yoga Exercises</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {yogaExercises.map(exercise => (
              <YogaExerciseCard
                key={exercise.id}
                title={exercise.title}
                description={exercise.description}
                shortDemoUrl={exercise.shortDemoUrl}
                fullTutorialUrl={exercise.fullTutorialUrl}
                thumbnailUrl={exercise.thumbnailUrl}
                duration={exercise.duration}
                benefits={exercise.benefits}
              />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-blue-800 dark:text-blue-300">Recommended Routines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {yogaRoutines.map(routine => (
              <YogaRoutineCard
                key={routine.id}
                id={routine.id}
                title={routine.title}
                description={routine.description}
                duration={routine.duration}
                level={routine.level}
                steps={routine.steps}
              />
            ))}
          </div>
        </section>

        <section className="mb-6">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-blue-800 dark:text-blue-300">Breathing Exercise</h3>
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse" style={{ animationDuration: '5s' }}></div>
                  <div className="absolute inset-4 rounded-full bg-blue-500/40 animate-pulse" style={{ animationDuration: '5s', animationDelay: '0.5s' }}></div>
                  <div className="absolute inset-8 rounded-full bg-blue-500/60 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
                </div>
                <p className="text-center max-w-md text-blue-800 dark:text-blue-200">
                  Take a moment to breathe with this animation. Breathe in as the circle expands, 
                  and breathe out as it contracts. Just a few minutes can help restore calm and focus.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
};

export default MindfulnessPage;
