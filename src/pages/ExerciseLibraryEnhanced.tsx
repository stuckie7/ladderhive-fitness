
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useExerciseLibraryEnhanced } from '@/hooks/exercise-library/hooks/use-exercise-library-enhanced';
import { Exercise } from '@/types/exercise';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Search, Filter, ArrowUpDown, Plus } from 'lucide-react';
import ExerciseCard from '@/components/exercises/ExerciseCard';
import ExerciseFilters from '@/components/exercises/ExerciseFilters';
import ExerciseFormDialog from '@/components/exercises/ExerciseFormDialog';
import { useToast } from '@/components/ui/use-toast';
import { ensureNumber } from '@/hooks/exercise-library/exercise-form-helpers';

// Define the form state interface
interface ExerciseFormState {
  name: string;
  prime_mover_muscle: string;
  secondary_muscles: string[];
  primary_equipment: string;
  equipment_options: string[];
  difficulty: string;
  exercise_type: string;
  recommended_reps: number;
  recommended_sets: number;
  rest_time: number;
  description: string;
  video_url: string;
  image_url: string;
  instructions: string;
}

const ExerciseLibraryEnhanced = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddExerciseForm, setShowAddExerciseForm] = useState(false);
  
  // Exercise library hook with appropriate type handling
  const { 
    exercises, 
    loading, 
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
  } = useExerciseLibraryEnhanced();

  // Initial form state
  const initialFormState: ExerciseFormState = {
    name: '',
    prime_mover_muscle: '',
    secondary_muscles: [],
    primary_equipment: '',
    equipment_options: [],
    difficulty: 'Beginner',
    exercise_type: 'Strength',
    recommended_reps: 10,
    recommended_sets: 3,
    rest_time: 60,
    description: '',
    video_url: '',
    image_url: '',
    instructions: ''
  };

  const [formState, setFormState] = useState<ExerciseFormState>(initialFormState);

  // Effect to load exercises on mount
  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Handle search input change
  const handleLocalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    handleSearchChange(e);
  };

  // Handle filter changes
  const handleLocalFilterChange = (filterType: string, value: string) => {
    handleFilterChange(filterType as any, value);
  };

  // Handle sort changes
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData: Record<string, any>) => {
    try {
      // Convert string values to numbers for numeric fields
      const exerciseData = {
        name: formData.name,
        prime_mover_muscle: formData.prime_mover_muscle,
        secondary_muscles: formData.secondary_muscles || [],
        primary_equipment: formData.primary_equipment,
        equipment_options: formData.equipment_options || [],
        difficulty: formData.difficulty,
        exercise_type: formData.exercise_type,
        recommended_reps: ensureNumber(formData.recommended_reps),
        recommended_sets: ensureNumber(formData.recommended_sets),
        rest_time: ensureNumber(formData.rest_time),
        description: formData.description,
        video_url: formData.video_url,
        image_url: formData.image_url,
        instructions: formData.instructions
      };

      await handleAddExercise(exerciseData);
      setShowAddExerciseForm(false);
      toast({
        title: "Exercise Added",
        description: "The exercise has been added to the library.",
      });
      
      // Reset form state
      setFormState(initialFormState);
      
      // Refresh exercises
      handleRefresh();
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast({
        title: "Error",
        description: "Failed to add exercise. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle exercise edit
  const handleEditExerciseLocal = (exercise: Exercise) => {
    // Convert exercise data to form state
    const formData = {
      name: exercise.name,
      prime_mover_muscle: exercise.prime_mover_muscle || exercise.target_muscle_group || '',
      secondary_muscles: Array.isArray(exercise.secondaryMuscles) ? exercise.secondaryMuscles : [],
      primary_equipment: exercise.primary_equipment || exercise.equipment || '',
      equipment_options: [], // Default empty array since it's not in Exercise type
      difficulty: exercise.difficulty || 'Beginner',
      exercise_type: exercise.exercise_classification || 'Strength',
      recommended_reps: 10, // Default value
      recommended_sets: 3, // Default value
      rest_time: 60, // Default value
      description: exercise.description || '',
      video_url: exercise.video_url || exercise.video_demonstration_url || '',
      image_url: exercise.image_url || '',
      instructions: Array.isArray(exercise.instructions) 
        ? exercise.instructions.join('\n') 
        : typeof exercise.instructions === 'string' 
          ? exercise.instructions 
          : ''
    };
    
    setFormState(formData);
    setShowAddExerciseForm(true);
  };

  // Sort exercises
  const sortedExercises = [...exercises].sort((a, b) => {
    // Handle different field types
    let valueA: any = a[sortField as keyof Exercise] || '';
    let valueB: any = b[sortField as keyof Exercise] || '';
    
    // Convert to strings for comparison
    valueA = String(valueA).toLowerCase();
    valueB = String(valueB).toLowerCase();
    
    // Compare based on direction
    if (sortDirection === 'asc') {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });

  // Mock filter options for compatibility
  const mockFilterOptions = {
    muscleGroups: ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core'],
    equipment: ['All', 'Bodyweight', 'Dumbbell', 'Barbell', 'Machine', 'Cable', 'Band'],
    difficulty: ['All', 'Beginner', 'Intermediate', 'Advanced']
  };

  // Mock active filters for compatibility
  const mockActiveFilters = {
    muscleGroup: 'all',
    equipment: 'all',
    difficulty: 'all'
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Exercise Library</h1>
            <p className="text-muted-foreground">Browse and search through our collection of exercises</p>
          </div>
          <Button 
            onClick={() => setShowAddExerciseForm(true)}
            className="mt-4 md:mt-0 bg-fitness-primary hover:bg-fitness-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Exercise
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={handleLocalSearchChange}
                  className="flex-1"
                />
                <Button onClick={() => handleSearchChange({ target: { value: searchQuery }} as React.ChangeEvent<HTMLInputElement>)}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleSortChange('name')}
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-4">
                  {/* Simple filter UI to replace ExerciseFilters */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Muscle Group</label>
                    <select 
                      className="border rounded p-2" 
                      onChange={(e) => handleLocalFilterChange('muscleGroup', e.target.value)}
                      defaultValue="all"
                    >
                      {mockFilterOptions.muscleGroups.map(option => (
                        <option key={option} value={option.toLowerCase()}>{option}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Equipment</label>
                    <select 
                      className="border rounded p-2"
                      onChange={(e) => handleLocalFilterChange('equipment', e.target.value)}
                      defaultValue="all"
                    >
                      {mockFilterOptions.equipment.map(option => (
                        <option key={option} value={option.toLowerCase()}>{option}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Difficulty</label>
                    <select 
                      className="border rounded p-2"
                      onChange={(e) => handleLocalFilterChange('difficulty', e.target.value)}
                      defaultValue="all"
                    >
                      {mockFilterOptions.difficulty.map(option => (
                        <option key={option} value={option.toLowerCase()}>{option}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button onClick={resetFilters} variant="outline">
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="w-full">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-video bg-muted">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedExercises.length === 0 ? (
              <Card className="p-6 text-center">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No exercises found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters to find exercises.
                </p>
                <Button onClick={resetFilters}>
                  Reset Filters
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedExercises.map((exercise) => (
                  <div 
                    key={exercise.id}
                    className="overflow-hidden rounded-md border bg-card text-card-foreground shadow hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {exercise.image_url ? (
                        <img 
                          src={exercise.image_url} 
                          alt={exercise.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <Dumbbell className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1 line-clamp-1">{exercise.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {exercise.muscle_group && (
                          <Badge variant="outline" className="text-xs">
                            {exercise.muscle_group}
                          </Badge>
                        )}
                        {exercise.equipment && (
                          <Badge variant="outline" className="text-xs">
                            {exercise.equipment}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-4 flex justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditExerciseLocal(exercise)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/exercises/${exercise.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="list">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedExercises.length === 0 ? (
              <Card className="p-6 text-center">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No exercises found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters to find exercises.
                </p>
                <Button onClick={resetFilters}>
                  Reset Filters
                </Button>
              </Card>
            ) : (
              <div className="space-y-2">
                {sortedExercises.map((exercise) => (
                  <Card 
                    key={exercise.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/exercises/${exercise.id}`)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      {exercise.image_url ? (
                        <img 
                          src={exercise.image_url} 
                          alt={exercise.name}
                          className="h-12 w-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center">
                          <Dumbbell className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{exercise.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {exercise.muscle_group && (
                            <Badge variant="outline" className="text-xs">
                              {exercise.muscle_group}
                            </Badge>
                          )}
                          {exercise.equipment && (
                            <Badge variant="outline" className="text-xs">
                              {exercise.equipment}
                            </Badge>
                          )}
                          {exercise.difficulty && (
                            <Badge variant="outline" className="text-xs">
                              {exercise.difficulty}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditExerciseLocal(exercise);
                        }}
                      >
                        Edit
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ExerciseFormDialog
        open={showAddExerciseForm}
        onOpenChange={setShowAddExerciseForm}
        onSubmit={handleFormSubmit}
        initialValues={formState}
        filterOptions={mockFilterOptions}
      />
    </AppLayout>
  );
};

export default ExerciseLibraryEnhanced;
