
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Play } from "lucide-react";
import yogaRoutines from "@/data/yoga-routines";
import yogaExercises from "@/data/yoga-exercises";
import YogaExerciseCard from "@/components/mindfulness/YogaExerciseCard";
import { useToast } from "@/components/ui/use-toast";

const YogaRoutineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(yogaRoutines.find(r => r.id === id));
  const { toast } = useToast();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (!routine) {
      // Routine not found, redirect to mindfulness page
      navigate("/mindfulness");
    }
  }, [routine, navigate]);
  
  const handleBack = () => {
    navigate("/mindfulness");
  };
  
  const handleStartRoutine = () => {
    // In a real app, we might start a session here
    // For now, we'll just show a toast notification
    toast({
      title: "Routine Started",
      description: `You've started the ${routine?.title} routine. Follow along with the steps.`,
    });
    
    // Record the practice in local storage to update progress
    const savedDays = localStorage.getItem('mindful_practice_days');
    const currentDays = savedDays ? parseInt(savedDays, 10) : 0;
    localStorage.setItem('mindful_practice_days', (currentDays + 1).toString());
    
    // Scroll to the routine steps section
    document.querySelector('.routine-steps')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  if (!routine) {
    return null; // Will redirect in useEffect
  }
  
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  // Find the exercises used in this routine
  const routineExerciseNames = routine.steps.map(step => step.exercise.toLowerCase());
  const relevantExercises = yogaExercises.filter(exercise => 
    routineExerciseNames.some(name => exercise.title.toLowerCase().includes(name))
  );

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" className="mb-6" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Mindfulness
        </Button>
        
        <div className="mb-8">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{routine.title}</h1>
              <div className="flex items-center gap-2">
                <Badge className={getLevelColor(routine.level)}>
                  {routine.level}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{routine.duration}</span>
                </div>
              </div>
            </div>
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
              onClick={handleStartRoutine}
            >
              <Play className="mr-2 h-4 w-4" /> 
              Start Routine
            </Button>
          </div>
          
          <p className="text-muted-foreground whitespace-pre-line">
            {routine.description}
          </p>
        </div>
        
        <Card className="mb-8 routine-steps">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Routine Steps</h2>
            <ol className="space-y-4">
              {routine.steps.map((step, index) => (
                <li key={index} className="pb-4 border-b border-gray-200 dark:border-gray-800 last:border-0">
                  <div className="flex items-start">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-medium text-lg">{step.exercise}</h3>
                      <p className="text-sm text-muted-foreground my-1">{step.duration}</p>
                      {step.description && (
                        <p className="text-sm">{step.description}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
        
        <h2 className="text-2xl font-semibold mb-6">Featured Exercises</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {relevantExercises.map(exercise => (
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
      </div>
    </AppLayout>
  );
};

export default YogaRoutineDetailPage;
