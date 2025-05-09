
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useWorkoutBuilder } from '@/hooks/use-workout-builder';
import { useParams, useSearchParams } from 'react-router-dom';
import WorkoutBuilderHeader from '@/components/workouts/builder/WorkoutBuilderHeader';
import WorkoutBuilderDetailsForm from '@/components/workouts/builder/WorkoutBuilderDetailsForm';
import WorkoutBuilderExerciseList from '@/components/workouts/builder/WorkoutBuilderExerciseList';
import ExerciseSearchPanel from '@/components/workouts/builder/ExerciseSearchPanel';
import { Dialog } from '@/components/ui/dialog';
import WorkoutTemplateSelector from '@/components/workouts/builder/WorkoutTemplateSelector';
// Import the correct WorkoutTemplate type
import { WorkoutTemplate } from '@/hooks/workout-builder/template-management';

const WorkoutBuilder = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const wodId = searchParams.get('wod');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  
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
    await saveWorkout();
  };

  const handleCreateTemplate = async () => {
    await saveAsTemplate(workout);
  };
  
  const handleSelectTemplate = async (templateId: string) => {
    if (loadTemplateFromPreparedWorkout) {
      await loadTemplateFromPreparedWorkout(templateId);
    }
  };
  
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
              onUpdate={setWorkoutInfo} 
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
            templates={templates as WorkoutTemplate[]}
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
