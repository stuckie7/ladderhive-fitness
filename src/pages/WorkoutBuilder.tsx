
import React, { useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useWorkoutBuilder } from '@/hooks/use-workout-builder';
import { useParams, useSearchParams } from 'react-router-dom';
import WorkoutBuilderHeader from '@/components/workouts/builder/WorkoutBuilderHeader';
import WorkoutBuilderDetailsForm from '@/components/workouts/builder/WorkoutBuilderDetailsForm';
import WorkoutBuilderExerciseList from '@/components/workouts/builder/WorkoutBuilderExerciseList';
import ExerciseSearchPanel from '@/components/workouts/builder/ExerciseSearchPanel';

const WorkoutBuilder = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const wodId = searchParams.get('wod');
  
  const {
    workout,
    exercises,
    searchResults,
    searchQuery,
    isLoading,
    isSaving,
    
    setWorkoutInfo,
    handleSearchChange,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    updateExerciseDetails,
    moveExerciseUp,
    moveExerciseDown,
    
    saveWorkout,
    loadWorkout,
    loadTemplateFromPreparedWorkout,
    loadTemplateFromWod,
  } = useWorkoutBuilder(id);
  
  useEffect(() => {
    if (templateId) {
      loadTemplateFromPreparedWorkout(templateId);
    } else if (wodId) {
      loadTemplateFromWod(wodId);
    }
  }, [templateId, wodId, loadTemplateFromPreparedWorkout, loadTemplateFromWod]);
  
  return (
    <AppLayout>
      <WorkoutBuilderHeader 
        isNew={!id} 
        isSaving={isSaving} 
        onSave={saveWorkout} 
      />
      
      <div className="container mx-auto px-4 py-6">
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
              isLoading={isLoading}
            />
          </div>
          
          <div>
            <ExerciseSearchPanel
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              searchResults={searchResults}
              onAddExercise={addExerciseToWorkout}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkoutBuilder;
