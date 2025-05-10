
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell } from "lucide-react";
import { WorkoutDetail } from "@/hooks/use-workout-builder";

interface WorkoutBuilderDetailsFormProps {
  workout: WorkoutDetail;
  setWorkoutInfo: (info: Partial<WorkoutDetail>) => void;
}

const WorkoutBuilderDetailsForm: React.FC<WorkoutBuilderDetailsFormProps> = ({ 
  workout, 
  setWorkoutInfo 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="col-span-1 lg:col-span-3">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Dumbbell className="mr-2 h-5 w-5 text-fitness-primary" />
              Workout Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="workout-title">Workout Name</Label>
              <Input
                id="workout-title"
                placeholder="My Awesome Workout"
                value={workout.title}
                onChange={(e) => setWorkoutInfo({ title: e.target.value })}
                className="bg-gray-950"
              />
            </div>
            <div>
              <Label htmlFor="workout-difficulty">Difficulty</Label>
              <Select
                value={workout.difficulty || "beginner"}
                onValueChange={(value) => setWorkoutInfo({ difficulty: value })}
              >
                <SelectTrigger id="workout-difficulty" className="bg-gray-950">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="workout-category">Category</Label>
              <Select
                value={workout.category || "strength"}
                onValueChange={(value) => setWorkoutInfo({ category: value })}
              >
                <SelectTrigger id="workout-category" className="bg-gray-950">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength Training</SelectItem>
                  <SelectItem value="hiit">HIIT</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                  <SelectItem value="balance">Balance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="workout-description">Description</Label>
              <Input
                id="workout-description"
                placeholder="A brief description of your workout"
                value={workout.description || ""}
                onChange={(e) => setWorkoutInfo({ description: e.target.value })}
                className="bg-gray-950"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutBuilderDetailsForm;
