import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAIWorkoutPlans } from "@/hooks/workouts/ai-plans/useAIWorkoutPlans";
import { DifficultyBadge } from "../../ui/difficulty-badge";
import { EquipmentIcon } from "../../ui/equipment-icon";
import { AIWorkoutPlan } from '@/types/workouts/ai-plans/types';
import { Exercise } from '@/hooks/workouts/ai-plans/useAIWorkoutPlans';
import ExerciseVideoHandler from "@/components/exercises/ExerciseVideoHandler";

import AppLayout from '@/components/layout/AppLayout';

export default function AIWorkoutPlans() {
  const { plans, loading, error } = useAIWorkoutPlans();
  const [selectedPlan, setSelectedPlan] = useState<AIWorkoutPlan | null>(null);

  const handlePreview = (plan: AIWorkoutPlan) => {
    setSelectedPlan(plan);
  };

  const handleStart = (planId: string) => {
    console.log('Starting workout:', planId);
    // Add workout start logic here
  };

  const handleClosePreview = () => {
    setSelectedPlan(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold mb-2">No workout plans available</h2>
        <p className="text-muted-foreground">Please try again later or check your filters.</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">AI Workout Plans</h1>
          <p className="text-muted-foreground">Smartly designed workouts tailored for your fitness goals</p>
        </div>

        {selectedPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card w-full max-w-2xl mx-4 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{selectedPlan.title}</h2>
                <button
                  onClick={handleClosePreview}
                  className="text-muted-foreground hover:text-primary"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={selectedPlan.difficulty} />
                  <span className="text-sm text-muted-foreground">• {selectedPlan.duration}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedPlan.focus}
                  </Badge>
                  <span className="text-sm text-muted-foreground">•</span>
                  <div className="flex items-center gap-1">
                    {selectedPlan.equipment?.map((eq: string) => (
                      <EquipmentIcon key={eq} equipment={eq} size={16} />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Exercises</h3>
                  <div className="space-y-4">
                    {selectedPlan.exercises?.map((exercise, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary font-semibold">{index + 1}</span>
                          </span>
                          <div className="flex-1">
                            <div className="font-medium">{exercise.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {exercise.sets} sets × {exercise.reps} reps • Rest {exercise.rest}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2">
                          <ExerciseVideoHandler
                            url={exercise.video_url}
                            title={`${exercise.name} Tutorial`}
                            className="rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleClosePreview}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleStart(selectedPlan.id)}
                >
                  Start Workout
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan: AIWorkoutPlan) => (
            <Card key={plan.id} className="group relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">{plan.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <DifficultyBadge difficulty={plan.difficulty} />
                    <span className="text-sm text-muted-foreground">• {plan.duration}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {plan.focus}
                    </Badge>
                    <span className="text-sm text-muted-foreground">•</span>
                    <div className="flex items-center gap-1">
                      {plan.equipment?.map((eq: string) => (
                        <EquipmentIcon key={eq} equipment={eq} size={16} />
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-24"
                      onClick={() => handlePreview(plan)}
                    >
                      Preview
                    </Button>
                    <Button
                      className="w-24"
                      onClick={() => handleStart(plan.id)}
                    >
                      Start
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
