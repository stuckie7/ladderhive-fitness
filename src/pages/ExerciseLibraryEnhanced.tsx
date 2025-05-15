
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useExerciseLibraryEnhanced } from "@/hooks/exercise-library/hooks/use-exercise-library-enhanced";
import ExercisesEnhancedNavigation from "@/components/exercises/ExercisesEnhancedNavigation";
import ExerciseSearchAndFilters from "@/components/exercises/ExerciseSearchAndFilters";
import ExerciseCardGrid from "@/components/exercises/ExerciseCardGrid";
import ExercisePagination from "@/components/exercises/ExercisePagination";
import ExerciseFormDialog from "@/components/exercises/ExerciseFormDialog";
import ExerciseDeleteDialog from "@/components/exercises/ExerciseDeleteDialog";
import EnhancedExerciseHeader from "@/components/exercises/EnhancedExerciseHeader";
import ExerciseTableNotFoundError from "@/components/exercises/ExerciseTableNotFoundError";
import ExerciseCountDisplay from "@/components/exercises/ExerciseCountDisplay";
import { Exercise } from "@/types/exercise";

const ExerciseLibraryEnhanced = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const {
    exercises,
    loading,
    searchQuery,
    muscleGroups,
    equipmentTypes,
    difficultyLevels,
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    currentPage,
    totalCount,
    tableExists,
    formState,
    currentExercise,
    ITEMS_PER_PAGE,
    handleSearchChange,
    handleFilterChange,
    resetFilters,
    handleFormChange,
    handleAddExercise,
    handleEditExercise,
    handleDeleteExercise,
    openEditDialog,
    openDeleteDialog,
    handleRefresh,
    setCurrentPage
  } = useExerciseLibraryEnhanced();

  // Wrapper functions to handle dialog states
  const handleOpenAddDialog = () => setIsAddDialogOpen(true);
  
  const handleOpenEditDialog = (exercise: Exercise) => {
    openEditDialog(exercise);
    setIsEditDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (exercise: Exercise) => {
    openDeleteDialog(exercise);
    setIsDeleteDialogOpen(true);
  };

  // Convert form change handler to match form dialog component
  const adaptedFormChangeHandler = (field: string, value: string) => {
    const mockEvent = {
      target: { name: field, value }
    } as React.ChangeEvent<HTMLInputElement>;
    handleFormChange(mockEvent);
  };

  // Handle search changes with proper event typing - this was the problematic part
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(e);
  };

  // Adapt the delete handler to match the expected signature
  const handleDeleteConfirm = () => {
    if (currentExercise) {
      handleDeleteExercise(currentExercise);
      setIsDeleteDialogOpen(false);
    }
  };

  // Render error state if table doesn't exist
  if (!tableExists) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <ExerciseTableNotFoundError />
        </div>
      </AppLayout>
    );
  }

  // Add missing properties required by ExerciseFormDialog to formState
  const enhancedFormState = {
    ...formState,
    // Add any missing required properties with sensible defaults
    short_youtube_demo: formState.video_demonstration_url || "",
    in_depth_youtube_exp: formState.video_explanation_url || "",
    prime_mover_muscle: formState.target_muscle_group || "", // Ensure prime_mover_muscle is required
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <EnhancedExerciseHeader 
          onRefresh={handleRefresh} 
          onAddNew={handleOpenAddDialog} 
        />
        
        {/* Navigation between different exercise views */}
        <ExercisesEnhancedNavigation currentView="exercise-library" />
        
        {/* Search and filters */}
        <ExerciseSearchAndFilters 
          searchQuery={searchQuery}
          onSearchChange={handleSearchInputChange}
          filters={{
            muscleGroup: selectedMuscleGroup,
            equipment: selectedEquipment,
            difficulty: selectedDifficulty
          }}
          muscleGroups={muscleGroups}
          equipmentTypes={equipmentTypes}
          difficultyLevels={difficultyLevels}
          onFilterChange={handleFilterChange}
          onResetFilters={resetFilters}
        />
        
        {/* Exercise count */}
        {!loading && (
          <ExerciseCountDisplay
            count={exercises.length}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalCount={totalCount}
          />
        )}
        
        {/* Exercise Cards */}
        <ExerciseCardGrid 
          exercises={exercises}
          loading={loading}
          onEdit={handleOpenEditDialog}
          onDelete={handleOpenDeleteDialog}
          onReset={resetFilters}
        />
        
        {/* Pagination */}
        {!loading && totalCount > ITEMS_PER_PAGE && (
          <ExercisePagination 
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
      
      {/* Add Exercise Dialog */}
      <ExerciseFormDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add New Exercise"
        description="Create a new exercise in your database"
        formState={enhancedFormState}
        onFormChange={adaptedFormChangeHandler}
        onSubmit={handleAddExercise}
        submitLabel="Add Exercise"
        muscleGroups={muscleGroups}
        equipmentTypes={equipmentTypes}
      />
      
      {/* Edit Exercise Dialog */}
      <ExerciseFormDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Exercise"
        description="Update the exercise details"
        formState={enhancedFormState}
        onFormChange={adaptedFormChangeHandler}
        onSubmit={handleEditExercise}
        submitLabel="Save Changes"
        muscleGroups={muscleGroups}
        equipmentTypes={equipmentTypes}
      />
      
      {/* Delete Confirmation Dialog */}
      <ExerciseDeleteDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        exercise={currentExercise}
        onConfirmDelete={handleDeleteConfirm}
      />
    </AppLayout>
  );
};

export default ExerciseLibraryEnhanced;
