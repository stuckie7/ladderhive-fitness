import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Link } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Exercise, ExerciseFull } from '@/types/exercise';
import { useExerciseLibraryEnhanced } from '@/hooks/exercise-library/hooks/use-exercise-library-enhanced';
import ExerciseFormDialog from '@/components/exercises/ExerciseFormDialog';

// Mock data for filter options
const mockFilterOptions = {
  muscleGroups: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'],
  equipmentTypes: ['Barbell', 'Dumbbell', 'Machine', 'Bodyweight', 'Cable'],
  exerciseTypes: ['Strength', 'Cardio', 'Plyometrics', 'Stretching', 'Powerlifting', 'Olympic Weightlifting'],
  intensityLevels: ['Low', 'Medium', 'High'],
};

const ExerciseLibraryEnhanced = () => {
  const { toast } = useToast();
  const {
    exercises,
    loading,
    searchQuery,
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    currentPage,
    totalCount,
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
  
  const [showAddExerciseForm, setShowAddExerciseForm] = useState(false);
  const [showEditExerciseForm, setShowEditExerciseForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [formData, setFormData] = useState<Record<string, any> | null>(null);

  const handleOpenAddExerciseForm = () => {
    setShowAddExerciseForm(true);
  };

  const handleCloseAddExerciseForm = () => {
    setShowAddExerciseForm(false);
  };

  const handleOpenEditExerciseForm = (exercise: Exercise) => {
    openEditDialog(exercise);
    setFormData({
      name: exercise.name,
      prime_mover_muscle: exercise.prime_mover_muscle,
      secondary_muscles: [],
      primary_equipment: exercise.primary_equipment,
      equipment_options: [],
      difficulty: exercise.difficulty,
      exercise_type: '',
      intensity_level: '',
      rest_time: 0,
      recommended_sets: 0,
      recommended_reps: 0,
      safety_notes: '',
      short_youtube_demo: exercise.video_demonstration_url
    });
    setShowEditExerciseForm(true);
  };

  const handleCloseEditExerciseForm = () => {
    setShowEditExerciseForm(false);
  };

  const handleOpenDeleteConfirmation = (exercise: Exercise) => {
    openDeleteDialog(exercise);
    setShowDeleteConfirmation(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
  };

  const handleSubmitAddExercise = async () => {
    if (formData) {
      await handleAddExercise(formData);
      handleCloseAddExerciseForm();
    }
  };

  const handleSubmitEditExercise = async () => {
    if (formData && currentExercise) {
      await handleEditExercise(formData);
      handleCloseEditExerciseForm();
    }
  };

  const handleSubmitDeleteExercise = async () => {
    await handleDeleteExercise();
    handleCloseDeleteConfirmation();
  };

  const handleFormValueChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formState = {
    name: '',
    prime_mover_muscle: '',
    secondary_muscles: [],
    primary_equipment: '',
    equipment_options: [],
    difficulty: '',
    exercise_type: '',
    intensity_level: '',
    rest_time: 0,
    recommended_sets: 0,
    recommended_reps: 0,
    safety_notes: '',
    short_youtube_demo: ''
  };

// Add this handler function to bridge the type mismatch
const handleFormSubmit = () => {
  if (formData) {
    handleAddExercise(formData);
  }
};

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exercise Library</h1>
        <Button onClick={handleOpenAddExerciseForm}>Add Exercise</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Input
          type="text"
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <Select value={selectedMuscleGroup} onValueChange={(value) => handleFilterChange('muscleGroup', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Muscle Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Muscle Groups</SelectItem>
            {mockFilterOptions.muscleGroups.map(group => (
              <SelectItem key={group} value={group}>{group}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedEquipment} onValueChange={(value) => handleFilterChange('equipment', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Equipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Equipment</SelectItem>
            {mockFilterOptions.equipmentTypes.map(equipment => (
              <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={(value) => handleFilterChange('difficulty', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Muscle Group</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                {Array(ITEMS_PER_PAGE).fill(null).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell className="text-right"><Skeleton /></TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              <>
                {exercises.map(exercise => (
                  <TableRow key={exercise.id}>
                    <TableCell className="font-medium">{exercise.name}</TableCell>
                    <TableCell>{exercise.muscle_group}</TableCell>
                    <TableCell>{exercise.equipment}</TableCell>
                    <TableCell>{exercise.difficulty}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenEditExerciseForm(exercise)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDeleteConfirmation(exercise)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {exercises.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No exercises found.</TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          Refresh
        </Button>
        <Pagination>
          <PaginationContent>
            <PaginationPrevious href="#" onClick={() => setCurrentPage(currentPage - 1)} />
            <PaginationNext href="#" onClick={() => setCurrentPage(currentPage + 1)} />
          </PaginationContent>
        </Pagination>
      </div>

      <ExerciseFormDialog
        open={showAddExerciseForm}
        onOpenChange={setShowAddExerciseForm}
        title="Add Exercise"
        description="Create a new exercise in the library."
        formState={formState}
        onFormChange={handleFormValueChange}
        onSubmit={handleFormSubmit}
        submitLabel="Create Exercise"
        muscleGroups={mockFilterOptions.muscleGroups}
        equipmentTypes={mockFilterOptions.equipmentTypes}
        exerciseTypes={mockFilterOptions.exerciseTypes}
        intensityLevels={mockFilterOptions.intensityLevels}
      />

      <ExerciseFormDialog
        open={showEditExerciseForm}
        onOpenChange={setShowEditExerciseForm}
        title="Edit Exercise"
        description="Edit the details of the selected exercise."
        formState={formData || formState}
        onFormChange={handleFormValueChange}
        onSubmit={handleSubmitEditExercise}
        submitLabel="Update Exercise"
        muscleGroups={mockFilterOptions.muscleGroups}
        equipmentTypes={mockFilterOptions.equipmentTypes}
        exerciseTypes={mockFilterOptions.exerciseTypes}
        intensityLevels={mockFilterOptions.intensityLevels}
      />

      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Exercise</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this exercise? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={currentExercise?.name || ''} className="col-span-3" disabled />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={handleCloseDeleteConfirmation}>Cancel</Button>
            <Button type="submit" variant="destructive" onClick={handleSubmitDeleteExercise}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseLibraryEnhanced;
