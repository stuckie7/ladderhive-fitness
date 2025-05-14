
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useWorkoutBuilder } from '@/hooks/use-workout-builder';
import WorkoutBuilderHeader from '@/components/workouts/builder/WorkoutBuilderHeader';
import WorkoutBuilderDetailsForm from '@/components/workouts/builder/WorkoutBuilderDetailsForm';
import WorkoutBuilderExerciseList from '@/components/workouts/builder/WorkoutBuilderExerciseList';
import ExerciseSearchPanel from '@/components/workouts/builder/ExerciseSearchPanel';
import { Dialog } from '@/components/ui/dialog';
import WorkoutTemplateSelector from '@/components/workouts/builder/WorkoutTemplateSelector';
import { WorkoutDetail } from '@/hooks/workout-builder/types';
import { WorkoutTemplate } from '@/hooks/workout-builder/template-management/template-types';
import { useToast } from '@/components/ui/use-toast';

const WorkoutBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const wodId = searchParams.get('wod');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const {
    workout,
    exercises,
    templates,
    searchResults,
    searchQuery,
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    isLoading,
    isSaving,
    
    setWorkoutInfo,
    resetWorkout,
    handleSearchChange,
    handleFilterChange,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    updateExerciseDetails,
    moveExerciseUp,
    moveExerciseDown,
    reorderExercises,
    
    saveWorkout,
    loadWorkout,
    loadTemplateFromPreparedWorkout,
    loadTemplateFromWod,
    saveAsTemplate,
    deleteTemplate,
  } = useWorkoutBuilder(id);
  
  useEffect(() => {
    if (templateId && loadTemplateFromPreparedWorkout) {
      loadTemplateFromPreparedWorkout(templateId);
    } else if (wodId && loadTemplateFromWod) {
      loadTemplateFromWod(wodId);
    }
  }, [templateId, wodId, loadTemplateFromPreparedWorkout, loadTemplateFromWod]);

  // Wrapper functions to match expected prop types
  const handleSave = async () => {
    const result = await saveWorkout();
    if (result && result.id) {
      toast({
        title: "Success",
        description: "Workout saved successfully!",
      });
      
      // Navigate to the workout detail page if it's a new workout
      if (id !== result.id) {
        navigate(`/workouts/${result.id}`);
      }
    }
  };

  const handleCreateTemplate = async () => {
    await saveAsTemplate(workout);
  };
  
  const handleSelectTemplate = async (templateId: string) => {
    if (loadTemplateFromPreparedWorkout) {
      await loadTemplateFromPreparedWorkout(templateId);
      setIsTemplateDialogOpen(false);
    }
  };

  // Wrapper function for WorkoutBuilderDetailsForm's onUpdate prop
  const handleUpdateWorkoutInfo = (info: Partial<WorkoutDetail>) => {
    setWorkoutInfo(info);
  };
  
  // Cast templates to the correct type for WorkoutTemplateSelector
  const templateItems = templates as unknown as WorkoutTemplate[];
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <WorkoutBuilderHeader 
          id={id}
          isSaving={isSaving} 
          handleSave={handleSave}
          handleCreateTemplate={handleCreateTemplate}
          setIsTemplateDialogOpen={setIsTemplateDialogOpen}
          resetWorkout={resetWorkout}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <WorkoutBuilderDetailsForm 
              workout={workout} 
              onUpdate={handleUpdateWorkoutInfo} 
              isLoading={isLoading}
            />
            
            <WorkoutBuilderExerciseList 
              exercises={exercises}
              onRemove={removeExerciseFromWorkout}
              onUpdate={updateExerciseDetails}
              onMoveUp={moveExerciseUp}
              onMoveDown={moveExerciseDown}
              onReorder={reorderExercises}
              isLoading={isLoading}
            />
          </div>
          
          <div>
            <ExerciseSearchPanel
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              searchResults={searchResults}
              onAddExercise={addExerciseToWorkout}
              selectedMuscleGroup={selectedMuscleGroup}
              selectedEquipment={selectedEquipment}
              selectedDifficulty={selectedDifficulty}
              onFilterChange={handleFilterChange}
              isLoading={isLoading}
            />
          </div>
        </div>

        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <WorkoutTemplateSelector 
            templates={templateItems}
            onSelectTemplate={handleSelectTemplate}
            onDeleteTemplate={deleteTemplate}
            onClose={() => setIsTemplateDialogOpen(false)}
          />
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default WorkoutBuilder;
