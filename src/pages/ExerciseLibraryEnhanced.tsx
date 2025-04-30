
import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { ExerciseFull } from "@/types/exercise";
import { supabase } from "@/integrations/supabase/client";
import { checkExercisesFullTableExists } from "@/hooks/exercise-library/services/exercise-fetch-service";

// Import our new components
import ExerciseSearchAndFilters from "@/components/exercises/ExerciseSearchAndFilters";
import ExerciseCardGrid from "@/components/exercises/ExerciseCardGrid";
import ExercisePagination from "@/components/exercises/ExercisePagination";
import ExerciseFormDialog from "@/components/exercises/ExerciseFormDialog";
import ExerciseDeleteDialog from "@/components/exercises/ExerciseDeleteDialog";

const ITEMS_PER_PAGE = 12;

const ExerciseLibraryEnhanced = () => {
  const [exercises, setExercises] = useState<ExerciseFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [difficultyLevels, setDifficultyLevels] = useState<string[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [tableExists, setTableExists] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<ExerciseFull | null>(null);
  
  const { toast } = useToast();
  
  // Form state for add/edit dialog
  const [formState, setFormState] = useState({
    name: "",
    prime_mover_muscle: "",
    primary_equipment: "",
    difficulty: "Beginner",
    short_youtube_demo: ""
  });

  // Load exercises and filter options
  useEffect(() => {
    const loadExerciseData = async () => {
      setLoading(true);
      
      try {
        // Check if the table exists first
        const exists = await checkExercisesFullTableExists();
        setTableExists(exists);
        
        if (!exists) {
          toast({
            title: "Table Not Found",
            description: "The exercises_full table does not exist in your database.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Build the query
        let query = supabase.from('exercises_full').select('*');
        
        // Apply filters
        if (selectedMuscleGroup !== 'all') {
          query = query.eq('prime_mover_muscle', selectedMuscleGroup);
        }
        
        if (selectedEquipment !== 'all') {
          query = query.eq('primary_equipment', selectedEquipment);
        }
        
        if (selectedDifficulty !== 'all') {
          query = query.eq('difficulty', selectedDifficulty);
        }
        
        // Apply search if provided
        if (searchQuery.trim()) {
          query = query.ilike('name', `%${searchQuery}%`);
        }
        
        // Apply pagination
        const { data, error } = await query
          .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1)
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        setExercises(data || []);
        
        // Get total count for pagination (separate query)
        let countQuery = supabase.from('exercises_full').select('*', { count: 'exact', head: true });
        
        // Apply the same filters to the count query
        if (selectedMuscleGroup !== 'all') {
          countQuery = countQuery.eq('prime_mover_muscle', selectedMuscleGroup);
        }
        
        if (selectedEquipment !== 'all') {
          countQuery = countQuery.eq('primary_equipment', selectedEquipment);
        }
        
        if (selectedDifficulty !== 'all') {
          countQuery = countQuery.eq('difficulty', selectedDifficulty);
        }
        
        // Apply search to count if provided
        if (searchQuery.trim()) {
          countQuery = countQuery.ilike('name', `%${searchQuery}%`);
        }
        
        const countResponse = await countQuery;
        setTotalCount(countResponse.count || 0);
        
        // Load filter options if they're not already loaded
        if (muscleGroups.length === 0) {
          await loadFilterOptions();
        }
      } catch (error) {
        console.error("Failed to load exercise data:", error);
        toast({
          title: "Error",
          description: "Failed to load exercise data. Check the console for details.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadExerciseData();
  }, [searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, currentPage]);
  
  // Load filter options from the database
  const loadFilterOptions = async () => {
    try {
      // Get unique muscle groups
      const muscleGroupsResponse = await supabase
        .from('exercises_full')
        .select('prime_mover_muscle')
        .not('prime_mover_muscle', 'is', null);
        
      if (muscleGroupsResponse.data) {
        const uniqueMuscleGroups = Array.from(new Set(
          muscleGroupsResponse.data
            .map(item => item.prime_mover_muscle)
            .filter(Boolean)
        )).sort();
        setMuscleGroups(uniqueMuscleGroups as string[]);
      }
      
      // Get unique equipment types
      const equipmentResponse = await supabase
        .from('exercises_full')
        .select('primary_equipment')
        .not('primary_equipment', 'is', null);
        
      if (equipmentResponse.data) {
        const uniqueEquipment = Array.from(new Set(
          equipmentResponse.data
            .map(item => item.primary_equipment)
            .filter(Boolean)
        )).sort();
        setEquipmentTypes(uniqueEquipment as string[]);
      }
      
      // Get unique difficulty levels
      const difficultyResponse = await supabase
        .from('exercises_full')
        .select('difficulty')
        .not('difficulty', 'is', null);
        
      if (difficultyResponse.data) {
        const uniqueDifficulties = Array.from(new Set(
          difficultyResponse.data
            .map(item => item.difficulty)
            .filter(Boolean)
        )).sort();
        setDifficultyLevels(uniqueDifficulties as string[]);
      }
    } catch (error) {
      console.error("Failed to load filter options:", error);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page on new search
  };
  
  // Handle filter change
  const handleFilterChange = (key: "muscleGroup" | "equipment" | "difficulty", value: string) => {
    setCurrentPage(0); // Reset to first page when filter changes
    
    switch (key) {
      case "muscleGroup":
        setSelectedMuscleGroup(value);
        break;
      case "equipment":
        setSelectedEquipment(value);
        break;
      case "difficulty":
        setSelectedDifficulty(value);
        break;
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedMuscleGroup("all");
    setSelectedEquipment("all");
    setSelectedDifficulty("all");
    setCurrentPage(0);
  };
  
  // Handle form input changes
  const handleFormChange = (field: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle add exercise
  const handleAddExercise = async () => {
    try {
      const { error } = await supabase
        .from('exercises_full')
        .insert([{
          name: formState.name,
          prime_mover_muscle: formState.prime_mover_muscle,
          primary_equipment: formState.primary_equipment,
          difficulty: formState.difficulty,
          short_youtube_demo: formState.short_youtube_demo
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Exercise Added",
        description: `Successfully added ${formState.name}`,
      });
      
      // Reset form and refresh data
      setFormState({
        name: "",
        prime_mover_muscle: "",
        primary_equipment: "",
        difficulty: "Beginner",
        short_youtube_demo: ""
      });
      setIsAddDialogOpen(false);
      
      // Refresh the exercise list
      const { data } = await supabase
        .from('exercises_full')
        .select('*')
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1)
        .order('name');
      
      if (data) setExercises(data);
      
    } catch (error) {
      console.error("Failed to add exercise:", error);
      toast({
        title: "Error",
        description: "Failed to add exercise. Check the console for details.",
        variant: "destructive"
      });
    }
  };
  
  // Handle edit exercise
  const handleEditExercise = async () => {
    if (!currentExercise) return;
    
    try {
      const { error } = await supabase
        .from('exercises_full')
        .update({
          name: formState.name,
          prime_mover_muscle: formState.prime_mover_muscle,
          primary_equipment: formState.primary_equipment,
          difficulty: formState.difficulty,
          short_youtube_demo: formState.short_youtube_demo
        })
        .eq('id', currentExercise.id);
      
      if (error) throw error;
      
      toast({
        title: "Exercise Updated",
        description: `Successfully updated ${formState.name}`,
      });
      
      setIsEditDialogOpen(false);
      
      // Refresh the exercise list
      const { data } = await supabase
        .from('exercises_full')
        .select('*')
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1)
        .order('name');
      
      if (data) setExercises(data);
      
    } catch (error) {
      console.error("Failed to update exercise:", error);
      toast({
        title: "Error",
        description: "Failed to update exercise. Check the console for details.",
        variant: "destructive"
      });
    }
  };
  
  // Handle delete exercise
  const handleDeleteExercise = async () => {
    if (!currentExercise) return;
    
    try {
      const { error } = await supabase
        .from('exercises_full')
        .delete()
        .eq('id', currentExercise.id);
      
      if (error) throw error;
      
      toast({
        title: "Exercise Deleted",
        description: `Successfully deleted ${currentExercise.name}`,
      });
      
      setIsDeleteDialogOpen(false);
      
      // Refresh the exercise list
      const { data } = await supabase
        .from('exercises_full')
        .select('*')
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1)
        .order('name');
      
      if (data) setExercises(data);
      
    } catch (error) {
      console.error("Failed to delete exercise:", error);
      toast({
        title: "Error",
        description: "Failed to delete exercise. Check the console for details.",
        variant: "destructive"
      });
    }
  };
  
  // Open edit dialog with exercise data
  const openEditDialog = (exercise: ExerciseFull) => {
    setCurrentExercise(exercise);
    setFormState({
      name: exercise.name || "",
      prime_mover_muscle: exercise.prime_mover_muscle || "",
      primary_equipment: exercise.primary_equipment || "",
      difficulty: exercise.difficulty || "Beginner",
      short_youtube_demo: exercise.short_youtube_demo || ""
    });
    setIsEditDialogOpen(true);
  };
  
  // Open delete confirmation dialog
  const openDeleteDialog = (exercise: ExerciseFull) => {
    setCurrentExercise(exercise);
    setIsDeleteDialogOpen(true);
  };

  // Render error state if table doesn't exist
  if (!tableExists) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-700 dark:text-red-400">
              Table Not Found
            </h1>
            <p className="mb-6 text-red-600 dark:text-red-300">
              The exercises_full table does not exist in your Supabase database.
              Please create the table and import exercise data before using this feature.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
              <Button variant="default">
                Go to Dashboard
              </Button>
            </div>
            <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded border text-left">
              <h3 className="font-medium mb-2">Expected Table Structure:</h3>
              <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto">
                {`CREATE TABLE exercises_full (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  prime_mover_muscle TEXT,
  primary_equipment TEXT,
  difficulty TEXT,
  short_youtube_demo TEXT,
  in_depth_youtube_exp TEXT,
  -- Additional fields...
);`}
              </pre>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Exercise Library</h1>
            <p className="text-muted-foreground">
              Browse, search, and manage your exercise database
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </div>
        </div>
        
        {/* Search and filters */}
        <ExerciseSearchAndFilters 
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
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
        {!loading && exercises.length > 0 && (
          <p className="mb-4 text-muted-foreground">
            Showing {exercises.length} exercises {totalCount > 0 ? `(${currentPage * ITEMS_PER_PAGE + 1}-${Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount)} of ${totalCount})` : ''}
          </p>
        )}
        
        {/* Exercise Cards */}
        <ExerciseCardGrid 
          exercises={exercises}
          loading={loading}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onReset={resetFilters}
        />
        
        {/* Pagination */}
        {!loading && exercises.length > 0 && (
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
        formState={formState}
        onFormChange={handleFormChange}
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
        formState={formState}
        onFormChange={handleFormChange}
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
        onConfirmDelete={handleDeleteExercise}
      />
    </AppLayout>
  );
};

export default ExerciseLibraryEnhanced;
