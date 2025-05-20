import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useAIWorkoutGenerator } from "@/hooks/workouts/ai-generator/useAIWorkoutGenerator";
import { AIGenerationParams } from "@/types/workouts/ai-generator/types";

const WORKOUT_TYPES = ['strength', 'hypertrophy', 'endurance', 'functional'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const MUSCLE_GROUPS = [
  'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full body'
];
const EQUIPMENT = [
  'barbell', 'dumbbells', 'bodyweight', 'kettlebells', 'bands', 'machine'
];

const AIWorkoutGenerator = () => {
  const {
    params,
    generatedWorkout,
    isGenerating,
    error,
    generateWorkout,
    refineWorkout,
    saveWorkout,
  } = useAIWorkoutGenerator();

  const handleGenerate = () => {
    generateWorkout(params);
  };

  const handleRefine = (exerciseIndex: number, changes: Partial<any>) => {
    refineWorkout(exerciseIndex, changes);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Workout Designer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Workout Type */}
            <div>
              <label className="text-sm font-medium">Workout Type</label>
              <Select
                value={params.workoutType}
                onValueChange={(value) => {
                  generateWorkout({ ...params, workoutType: value as 'strength' | 'hypertrophy' | 'endurance' | 'functional' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  {WORKOUT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="text-sm font-medium">Difficulty Level</label>
              <Select
                value={params.difficulty}
                onValueChange={(value) => {
                  generateWorkout({ ...params, difficulty: value as 'beginner' | 'intermediate' | 'advanced' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Muscle Groups */}
            <div>
              <label className="text-sm font-medium">Target Muscle Groups</label>
              <div className="space-y-2 mt-2">
                {MUSCLE_GROUPS.map((group) => (
                  <div key={group} className="flex items-center space-x-2">
                    <Checkbox
                      checked={params.targetMuscleGroups.includes(group)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          generateWorkout({ ...params, targetMuscleGroups: [...params.targetMuscleGroups, group] });
                        } else {
                          generateWorkout({ 
                            ...params, 
                            targetMuscleGroups: params.targetMuscleGroups.filter(g => g !== group) 
                          });
                        }
                      }}
                    />
                    <label className="text-sm">{group.charAt(0).toUpperCase() + group.slice(1)}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <label className="text-sm font-medium">Available Equipment</label>
              <div className="space-y-2 mt-2">
                {EQUIPMENT.map((eq) => (
                  <div key={eq} className="flex items-center space-x-2">
                    <Checkbox
                      checked={params.equipment.includes(eq)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          generateWorkout({ ...params, equipment: [...params.equipment, eq] });
                        } else {
                          generateWorkout({ 
                            ...params, 
                            equipment: params.equipment.filter(e => e !== eq) 
                          });
                        }
                      }}
                    />
                    <label className="text-sm">{eq.charAt(0).toUpperCase() + eq.slice(1)}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Slider
                value={[params.duration]}
                min={30}
                max={90}
                step={5}
                onValueChange={(value) => {
                  generateWorkout({ ...params, duration: value[0] });
                }}
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>30 min</span>
                <span>90 min</span>
              </div>
            </div>

            {/* Intensity */}
            <div>
              <label className="text-sm font-medium">Intensity (RPE)</label>
              <Slider
                value={[params.intensity]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => {
                  generateWorkout({ ...params, intensity: value[0] });
                }}
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>1 (Easy)</span>
                <span>10 (Max Effort)</span>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate Workout'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedWorkout && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-medium">{generatedWorkout.name}</h3>
              <p className="text-muted-foreground">{generatedWorkout.description}</p>

              <div className="space-y-4">
                {generatedWorkout.exercises.map((exercise, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium">{exercise.name}</h4>
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span>Sets: {exercise.sets}</span>
                        <span>Reps: {exercise.reps}</span>
                        <span>Rest: {exercise.rest}s</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {exercise.muscleGroups.map((group) => (
                          <span key={group} className="px-2 py-1 bg-muted rounded text-xs">
                            {group}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {exercise.equipment.map((eq) => (
                          <span key={eq} className="px-2 py-1 bg-muted rounded text-xs">
                            {eq}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2">
                        <label className="text-sm font-medium">Intensity</label>
                        <Slider
                          value={[exercise.intensity]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={(value) => handleRefine(index, { intensity: value[0] })}
                        />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{exercise.notes}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Button onClick={saveWorkout}>Save to Library</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
};

export default AIWorkoutGenerator;
