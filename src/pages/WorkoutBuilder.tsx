
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { useWorkoutBuilder } from "@/hooks/use-workout-builder";

// Refactored components
import WorkoutBuilderHeader from "@/components/workouts/builder/WorkoutBuilderHeader";
import WorkoutBuilderDetailsForm from "@/components/workouts/builder/WorkoutBuilderDetailsForm";
import WorkoutBuilderExerciseList from "@/components/workouts/builder/WorkoutBuilderExerciseList";
import ExerciseSearchPanel from "@/components/workouts/builder/ExerciseSearchPanel";
import WorkoutTemplateSelector from "@/components/workouts/builder/WorkoutTemplateSelector";

const WorkoutBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
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
    loadTemplate,
    deleteTemplate
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
        {/* Header with buttons */}
        <WorkoutBuilderHeader 
          id={id}
          isSaving={isSaving}
          handleSave={handleSave}
          handleCreateTemplate={handleCreateTemplate}
          setIsTemplateDialogOpen={setIsTemplateDialogOpen}
          resetWorkout={resetWorkout}
        />
        
        {/* Workout Template Selector Dialog */}
        <WorkoutTemplateSelector 
          open={isTemplateDialogOpen}
          onOpenChange={setIsTemplateDialogOpen}
          templates={templates} 
          onSelectTemplate={loadTemplate}
          onDeleteTemplate={deleteTemplate}
        />
        
        {/* Workout details form */}
        <WorkoutBuilderDetailsForm 
          workout={workout}
          setWorkoutInfo={setWorkoutInfo}
        />
        
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
