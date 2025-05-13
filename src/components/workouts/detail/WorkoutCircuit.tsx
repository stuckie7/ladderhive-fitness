
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, ChevronDown, ChevronUp, Dumbbell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExerciseVideoHandler from "@/components/exercises/ExerciseVideoHandler";
import { useExercisesFull } from "@/hooks/use-exercises-full";
import { supabase } from "@/integrations/supabase/client";

// Updated interface to match the actual data structure from useWorkoutDetailEnhanced
interface WorkoutExercise {
  id: string;
  sets: number;
  reps: string | number;
  rest_seconds?: number;
  notes?: string;
  modifications?: string;
  order_index: number;
  exercise: {
    id: number | string;
    name: string;
    description?: string;
    short_youtube_demo?: string;
    youtube_thumbnail_url?: string;
    in_depth_youtube_exp?: string;
  };
}

interface SuggestedExercise {
  id: number | string;
  name: string;
  description?: string;
  short_youtube_demo?: string;
  youtube_thumbnail_url?: string;
  prime_mover_muscle?: string;
  primary_equipment?: string;
}

interface WorkoutCircuitProps {
  exercises: WorkoutExercise[];
}

const WorkoutCircuit: React.FC<WorkoutCircuitProps> = ({ exercises }) => {
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [suggestedExercises, setSuggestedExercises] = useState<SuggestedExercise[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);

  const toggleExpanded = (id: string) => {
    if (expandedExerciseId === id) {
      setExpandedExerciseId(null);
    } else {
      setExpandedExerciseId(id);
    }
  };

  const toggleCompleted = (id: string) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedExercises(newCompleted);
  };

  useEffect(() => {
    // Only fetch suggested exercises if there are no exercises in the workout
    if (exercises.length === 0) {
      fetchSuggestedExercises();
    }
  }, [exercises]);

  const fetchSuggestedExercises = async () => {
    setIsLoadingSuggestions(true);
    try {
      // Fetch exercises that have valid video or thumbnail URLs
      const { data, error } = await supabase
        .from('exercises_full')
        .select('id, name, description, short_youtube_demo, youtube_thumbnail_url, prime_mover_muscle, primary_equipment')
        .or('short_youtube_demo.neq.null,youtube_thumbnail_url.neq.null')
        .not('short_youtube_demo', 'is', null)
        .not('youtube_thumbnail_url', 'is', null)
        .limit(5)
        .order('name');

      if (error) {
        console.error('Error fetching suggested exercises:', error);
        return;
      }

      // Ensure data is not null before setting
      if (data) {
        setSuggestedExercises(data);
      }
    } catch (err) {
      console.error('Failed to fetch suggested exercises:', err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  if (exercises.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exercise Circuit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-1">No exercises in this workout</h3>
            <p className="text-muted-foreground mb-4">
              You might be interested in these exercise suggestions
            </p>
          </div>
          
          {isLoadingSuggestions ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-md p-4">
                  <div className="h-5 bg-gray-700/30 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-700/20 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {suggestedExercises.map((exercise) => (
                <div key={exercise.id} className="border rounded-md p-4 hover:bg-accent/5 transition-colors">
                  <div className="flex flex-wrap md:flex-nowrap gap-4">
                    <div className="w-full md:w-1/2">
                      <h4 className="font-medium">{exercise.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {exercise.prime_mover_muscle || 'Various muscles'} • {exercise.primary_equipment || 'Bodyweight'}
                      </p>
                      {exercise.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                          {exercise.description}
                        </p>
                      )}
                    </div>
                    <div className="w-full md:w-1/2 flex justify-center">
                      <ExerciseVideoHandler 
                        url={exercise.short_youtube_demo || ""}
                        thumbnailUrl={exercise.youtube_thumbnail_url}
                        className="max-w-[240px] max-h-[180px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Circuit</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {exercises.map((exercise, index) => {
            const exerciseName = exercise.exercise?.name || '';
            const isExpanded = expandedExerciseId === exercise.id;
            const isCompleted = completedExercises.has(exercise.id);
            // Use the correct video URL field that exists in the exercises_full table
            const videoUrl = exercise.exercise?.in_depth_youtube_exp || 
                           exercise.exercise?.short_youtube_demo;
            const thumbnailUrl = exercise.exercise?.youtube_thumbnail_url;
            
            return (
              <div 
                key={exercise.id} 
                className={`p-4 transition-colors ${isCompleted ? 'bg-green-50 dark:bg-green-900/10' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full p-1 min-w-[32px] h-8 mr-2 ${
                        isCompleted ? 'text-green-500' : 'text-muted-foreground'
                      }`}
                      onClick={() => toggleCompleted(exercise.id)}
                    >
                      <CheckCircle2 className={`h-5 w-5 ${isCompleted ? 'fill-green-500 text-white' : ''}`} />
                    </Button>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {index + 1}. {exerciseName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.rest_seconds && ` • ${exercise.rest_seconds}s rest`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => toggleExpanded(exercise.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {isExpanded && (
                  <div className="mt-4 pl-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        {exercise.exercise?.description && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Instructions</h4>
                            <p className="text-sm text-muted-foreground">
                              {exercise.exercise.description}
                            </p>
                          </div>
                        )}
                        
                        {exercise.notes && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Notes</h4>
                            <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                          </div>
                        )}
                        
                        {exercise.modifications && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Modifications</h4>
                            <p className="text-sm text-muted-foreground">{exercise.modifications}</p>
                          </div>
                        )}
                      </div>
                      
                      {videoUrl && (
                        <div className="flex justify-center md:justify-end">
                          <ExerciseVideoHandler 
                            url={videoUrl}
                            thumbnailUrl={thumbnailUrl}
                            className="max-w-[240px] max-h-[180px]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutCircuit;
