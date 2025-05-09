
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import WorkoutProgress from "@/components/workouts/WorkoutProgress";
import NutritionSearch from "@/components/nutrition/NutritionSearch";
import { Exercise } from "@/types/exercise";

interface WorkoutDetailLayoutProps {
  children: React.ReactNode;
  workoutId?: string;
}

const WorkoutDetailLayout = ({ children }: WorkoutDetailLayoutProps) => {
  return (
    <div className="container mx-auto px-4 py-6">
      {children}
    </div>
  );
};

export default WorkoutDetailLayout;
