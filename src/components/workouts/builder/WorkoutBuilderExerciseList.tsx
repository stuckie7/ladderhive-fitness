
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListChecks, Trash2, ArrowUp, ArrowDown, Edit, Grip } from "lucide-react";
import ExerciseVideoHandler from "@/components/exercises/ExerciseVideoHandler";
import { WorkoutExerciseDetail } from "@/hooks/use-workout-builder";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface WorkoutBuilderExerciseListProps {
  exercises: WorkoutExerciseDetail[];
  onRemove: (exerciseId: string) => void;
  onUpdate: (exerciseId: string, updates: Partial<WorkoutExerciseDetail>) => void;
  onMoveUp: (exerciseId: string) => void;
  onMoveDown: (exerciseId: string) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  isLoading?: boolean; // Add isLoading prop
}

const WorkoutBuilderExerciseList: React.FC<WorkoutBuilderExerciseListProps> = ({
  exercises,
  onRemove,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onReorder,
  isLoading = false // Default to false
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorder) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    onReorder(sourceIndex, destinationIndex);
  };
  
  // Show loading state if needed
  if (isLoading) {
    return (
      <Card className="glass-panel h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ListChecks className="mr-2 h-5 w-5 text-fitness-primary" />
            Loading Exercises...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-800/50 rounded-md"></div>
            <div className="h-20 bg-gray-800/50 rounded-md"></div>
            <div className="h-20 bg-gray-800/50 rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="glass-panel h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <ListChecks className="mr-2 h-5 w-5 text-fitness-primary" />
            Workout Exercises
          </div>
          <div className="text-sm text-muted-foreground">
            {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {exercises.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-gray-800 rounded-lg">
            <Dumbbell className="mx-auto h-12 w-12 text-gray-600 mb-2" />
            <h3 className="text-lg font-medium mb-2">No exercises added yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Search and add exercises from the library on the left.
            </p>
            <Button 
              onClick={() => setSearchModalOpen(true)}
              className="bg-fitness-primary hover:bg-fitness-primary/90"
            >
              <Search className="h-4 w-4 mr-2" />
              Search & Add Exercise
            </Button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="workout-exercises">
              {(provided) => (
                <div 
                  className="space-y-4" 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                >
                  {exercises.map((exercise, index) => (
                    <Draggable 
                      key={exercise.id} 
                      draggableId={exercise.id} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border border-gray-800 ${snapshot.isDragging ? 'ring-2 ring-fitness-primary shadow-lg' : ''}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab p-1 mr-1 hover:bg-gray-900 rounded"
                                >
                                  <Grip className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{exercise.exercise?.name}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {exercise.exercise?.prime_mover_muscle || exercise.exercise?.target_muscle_group} • {exercise.exercise?.primary_equipment || "Bodyweight"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => onMoveUp(exercise.id)}
                                  disabled={index === 0}
                                  className="h-7 w-7"
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => onMoveDown(exercise.id)}
                                  disabled={index === exercises.length - 1}
                                  className="h-7 w-7"
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => onRemove(exercise.id)}
                                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-950/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Exercise details form */}
                            <div className="grid grid-cols-4 gap-2 mb-3">
                              <div>
                                <Label htmlFor={`${exercise.id}-sets`} className="text-xs">Sets</Label>
                                <Input
                                  id={`${exercise.id}-sets`}
                                  type="number"
                                  min={1}
                                  value={exercise.sets}
                                  onChange={(e) => onUpdate(exercise.id, { sets: Number(e.target.value) })}
                                  className="h-8 bg-gray-950"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`${exercise.id}-reps`} className="text-xs">Reps</Label>
                                <Input
                                  id={`${exercise.id}-reps`}
                                  value={exercise.reps}
                                  onChange={(e) => onUpdate(exercise.id, { reps: e.target.value })}
                                  className="h-8 bg-gray-950"
                                  placeholder="10 or 8-12"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`${exercise.id}-weight`} className="text-xs">Weight (opt)</Label>
                                <Input
                                  id={`${exercise.id}-weight`}
                                  value={exercise.weight || ""}
                                  onChange={(e) => onUpdate(exercise.id, { weight: e.target.value })}
                                  className="h-8 bg-gray-950"
                                  placeholder="lb/kg"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`${exercise.id}-rest`} className="text-xs">Rest (sec)</Label>
                                <Input
                                  id={`${exercise.id}-rest`}
                                  type="number"
                                  min={0}
                                  step={5}
                                  value={exercise.rest_seconds}
                                  onChange={(e) => onUpdate(exercise.id, { rest_seconds: Number(e.target.value) })}
                                  className="h-8 bg-gray-950"
                                />
                              </div>
                            </div>
                            
                            {/* Notes */}
                            <div>
                              <Label htmlFor={`${exercise.id}-notes`} className="text-xs">Notes (optional)</Label>
                              <Input
                                id={`${exercise.id}-notes`}
                                value={exercise.notes || ""}
                                onChange={(e) => onUpdate(exercise.id, { notes: e.target.value })}
                                className="h-8 bg-gray-950"
                                placeholder="Add notes or instructions"
                              />
                            </div>
                            
                            {/* Video preview if available */}
                            {exercise.exercise?.video_demonstration_url || 
                             exercise.exercise?.short_youtube_demo || 
                             exercise.exercise?.in_depth_youtube_exp ? (
                              <div className="mt-3">
                                <ExerciseVideoHandler
                                  className="w-full max-w-[200px] h-[120px] mx-auto"
                                  url={exercise.exercise?.video_demonstration_url || 
                                       exercise.exercise?.short_youtube_demo || 
                                       exercise.exercise?.in_depth_youtube_exp || ""}
                                  thumbnailUrl={exercise.exercise?.youtube_thumbnail_url}
                                />
                              </div>
                            ) : null}
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutBuilderExerciseList;
