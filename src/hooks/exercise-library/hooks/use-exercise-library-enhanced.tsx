
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExerciseFull } from "@/types/exercise";
import { useToast } from "@/components/ui/use-toast";
import { checkExercisesFullTableExists } from "@/hooks/exercise-library/services/exercise-fetch-service";

const ITEMS_PER_PAGE = 12;

export const useExerciseLibraryEnhanced = () => {
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
    loadExerciseData();
  }, [searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, currentPage]);
  
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
      
      console.log("Fetched exercises:", data);
      
      // Map the data to include the required fields for ExerciseFull
      if (data) {
        const mappedData: ExerciseFull[] = data.map(item => ({
          ...item,
          // Add the required fields that might be missing
          target_muscle_group: item.prime_mover_muscle,
          video_demonstration_url: item.short_youtube_demo,
          video_explanation_url: item.in_depth_youtube_exp
        }));
        
        setExercises(mappedData);
      }
      
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
      
      // Reset form
      setFormState({
        name: "",
        prime_mover_muscle: "",
        primary_equipment: "",
        difficulty: "Beginner",
        short_youtube_demo: ""
      });
      
      // Refresh the exercise list
      loadExerciseData();
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
      
      // Refresh the exercise list
      loadExerciseData();
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
      
      // Refresh the exercise list
      loadExerciseData();
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
  };
  
  // Open delete confirmation dialog
  const openDeleteDialog = (exercise: ExerciseFull) => {
    setCurrentExercise(exercise);
  };

  // Refresh database to requery for exercises
  const handleRefresh = () => {
    setLoading(true);
    setCurrentPage(0); // Reset to first page
    loadFilterOptions(); // Reload filter options
    loadExerciseData(); // Reload exercise data
  };

  return {
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
  };
};
