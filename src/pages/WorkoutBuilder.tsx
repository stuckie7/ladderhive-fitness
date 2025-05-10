
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, Save, ArrowLeft, Plus, Trash2, Copy, BookOpen } from "lucide-react";
import WorkoutBuilderExerciseList from "@/components/workouts/builder/WorkoutBuilderExerciseList";
import ExerciseSearchPanel from "@/components/workouts/builder/ExerciseSearchPanel";
import { useAuth } from "@/context/AuthContext";
import { useWorkoutBuilder } from "@/hooks/use-workout-builder";
import WorkoutTemplateSelector from "@/components/workouts/builder/WorkoutTemplateSelector";

const WorkoutBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  
  const {
    workout,
    exercises,
    searchResults,
    searchQuery,
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    isLoading,
    isSaving,
    templates,
    
    setWorkoutInfo,
    handleSearchChange,
    handleFilterChange,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    updateExerciseDetails,
    moveExerciseUp,
    moveExerciseDown,
    reorderExercises,
    saveWorkout,
    resetWorkout,
    loadWorkout,
    saveAsTemplate,
    loadTemplate
  } = useWorkoutBuilder(id);
  
  useEffect(() => {
    if (id) {
      loadWorkout(id);
    } else {
      resetWorkout();
    }
  }, [id, loadWorkout, resetWorkout]);
  
  const handleSave = async () => {
    if (!workout.title.trim()) {
      toast({
        title: "Missing information",
        description: "Please add a title for your workout",
        variant: "destructive"
      });
      return;
    }
    
    if (exercises.length === 0) {
      toast({
        title: "No exercises added",
        description: "Please add at least one exercise to your workout",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const savedWorkout = await saveWorkout();
      toast({
        title: "Success",
        description: `Workout ${id ? "updated" : "created"} successfully`,
      });
      
      if (!id && savedWorkout?.id) {
        navigate(`/workout-builder/${savedWorkout.id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateTemplate = async () => {
    await saveAsTemplate();
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/workouts')}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold gradient-heading">
              {id ? "Edit Workout" : "Create New Workout"}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsTemplateDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <BookOpen className="h-4 w-4" />
              Templates
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCreateTemplate}
              className="flex items-center gap-1"
            >
              <Copy className="h-4 w-4" />
              Save as Template
            </Button>
            <Button variant="outline" onClick={resetWorkout}>
              Reset
            </Button>
            <Button 
              className="btn-fitness-primary" 
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Workout"}
            </Button>
          </div>
        </div>
        
        {/* Workout Template Selector Dialog */}
        <WorkoutTemplateSelector 
          open={isTemplateDialogOpen}
          onOpenChange={setIsTemplateDialogOpen}
          templates={templates} 
          onSelectTemplate={loadTemplate}
        />
        
        {/* Workout details form */}
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
        
        {/* Main workout builder area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Exercise search */}
          <div className="col-span-1">
            <ExerciseSearchPanel
              searchQuery={searchQuery}
              selectedMuscleGroup={selectedMuscleGroup}
              selectedEquipment={selectedEquipment}
              selectedDifficulty={selectedDifficulty}
              searchResults={searchResults}
              isLoading={isLoading}
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
              onAddExercise={addExerciseToWorkout}
            />
          </div>
          
          {/* Right side - Current workout exercises */}
          <div className="col-span-1 lg:col-span-2">
            <WorkoutBuilderExerciseList 
              exercises={exercises}
              onRemove={removeExerciseFromWorkout}
              onUpdate={updateExerciseDetails}
              onMoveUp={moveExerciseUp}
              onMoveDown={moveExerciseDown}
              onReorder={reorderExercises}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkoutBuilder;
