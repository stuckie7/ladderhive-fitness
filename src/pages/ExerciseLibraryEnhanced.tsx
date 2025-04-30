
import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Filter, Edit, Trash2, Info, Dumbbell, Youtube } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExerciseFull } from "@/types/exercise";
import { fetchExercisesFull, searchExercisesFull, checkExercisesFullTableExists } from "@/hooks/exercise-library/services/exercise-fetch-service";
import { supabase } from "@/integrations/supabase/client";

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
    target_muscle_group: "",
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
        
        // Load exercises based on filters and search query
        const filters = {
          muscleGroup: selectedMuscleGroup !== 'all' ? selectedMuscleGroup : undefined,
          equipment: selectedEquipment !== 'all' ? selectedEquipment : undefined,
          difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined
        };
        
        const data = await searchExercisesFull(
          searchQuery,
          filters,
          ITEMS_PER_PAGE,
          currentPage * ITEMS_PER_PAGE
        );
        
        setExercises(data);
        
        // Get total count for pagination (simplified approach)
        const countResponse = await supabase
          .from('exercises_full')
          .select('id', { count: 'exact', head: true });
          
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
        .select('target_muscle_group')
        .not('target_muscle_group', 'is', null);
        
      if (muscleGroupsResponse.data) {
        const uniqueMuscleGroups = Array.from(new Set(
          muscleGroupsResponse.data
            .map(item => item.target_muscle_group)
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
  
  // Handle add exercise
  const handleAddExercise = async () => {
    try {
      const { error } = await supabase
        .from('exercises_full')
        .insert([{
          name: formState.name,
          target_muscle_group: formState.target_muscle_group,
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
        target_muscle_group: "",
        primary_equipment: "",
        difficulty: "Beginner",
        short_youtube_demo: ""
      });
      setIsAddDialogOpen(false);
      
      // Refresh the exercise list
      const data = await fetchExercisesFull(ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
      setExercises(data);
      
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
          target_muscle_group: formState.target_muscle_group,
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
      const data = await fetchExercisesFull(ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
      setExercises(data);
      
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
      const data = await fetchExercisesFull(ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
      setExercises(data);
      
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
      target_muscle_group: exercise.target_muscle_group || "",
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
  
  // Handle form input changes
  const handleFormChange = (field: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Show appropriate difficulty badge color
  const getDifficultyBadgeClass = (difficulty: string | null) => {
    if (!difficulty) return "bg-gray-100 text-gray-800";
    
    switch(difficulty.toLowerCase()) {
      case 'beginner':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'intermediate':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 'advanced':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
  target_muscle_group TEXT,
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Exercise Library</h1>
            <p className="text-muted-foreground">
              Browse, search, and manage your exercise database
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exercise
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Exercise</DialogTitle>
                  <DialogDescription>
                    Create a new exercise in your database
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input 
                      id="name"
                      name="name" 
                      placeholder="Exercise name" 
                      value={formState.name} 
                      onChange={(e) => handleFormChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="muscle-group" className="text-sm font-medium">Target Muscle Group</label>
                      <Input 
                        id="muscle-group"
                        name="target_muscle_group"
                        list="muscle-groups"
                        placeholder="Target muscle" 
                        value={formState.target_muscle_group} 
                        onChange={(e) => handleFormChange('target_muscle_group', e.target.value)}
                      />
                      <datalist id="muscle-groups">
                        {muscleGroups.map(group => (
                          <option key={group} value={group} />
                        ))}
                      </datalist>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="equipment" className="text-sm font-medium">Equipment</label>
                      <Input 
                        id="equipment"
                        name="primary_equipment"
                        list="equipments"
                        placeholder="Equipment needed" 
                        value={formState.primary_equipment} 
                        onChange={(e) => handleFormChange('primary_equipment', e.target.value)}
                      />
                      <datalist id="equipments">
                        {equipmentTypes.map(eq => (
                          <option key={eq} value={eq} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="difficulty" className="text-sm font-medium">Difficulty Level</label>
                    <Select 
                      name="difficulty"
                      value={formState.difficulty} 
                      onValueChange={(value) => handleFormChange('difficulty', value)}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="video" className="text-sm font-medium">Video URL</label>
                    <Input 
                      id="video"
                      name="short_youtube_demo"
                      placeholder="YouTube video URL" 
                      value={formState.short_youtube_demo} 
                      onChange={(e) => handleFormChange('short_youtube_demo', e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddExercise}>Add Exercise</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search exercises by name"
                className="pl-10"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setSelectedMuscleGroup("all");
                setSelectedEquipment("all");
                setSelectedDifficulty("all");
                setCurrentPage(0);
              }} className="whitespace-nowrap">
                Reset Filters
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Muscle Group</label>
              <Select
                value={selectedMuscleGroup}
                onValueChange={setSelectedMuscleGroup}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All muscle groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All muscle groups</SelectItem>
                  {muscleGroups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Equipment</label>
              <Select
                value={selectedEquipment}
                onValueChange={setSelectedEquipment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All equipment</SelectItem>
                  {equipmentTypes.map((equipment) => (
                    <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select
                value={selectedDifficulty}
                onValueChange={setSelectedDifficulty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All difficulties</SelectItem>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Exercise Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : exercises.length > 0 ? (
          <>
            <p className="mb-4 text-muted-foreground">
              Showing {exercises.length} exercises {totalCount > 0 ? `(${currentPage * ITEMS_PER_PAGE + 1}-${Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount)} of ${totalCount})` : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises.map((exercise) => (
                <Card key={exercise.id} className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => openEditDialog(exercise)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600" 
                          onClick={() => openDeleteDialog(exercise)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {exercise.target_muscle_group && (
                          <Badge variant="outline" className="bg-muted/50">
                            {exercise.target_muscle_group}
                          </Badge>
                        )}
                        {exercise.primary_equipment && (
                          <Badge variant="outline" className="bg-muted/50">
                            {exercise.primary_equipment}
                          </Badge>
                        )}
                        {exercise.difficulty && (
                          <Badge className={getDifficultyBadgeClass(exercise.difficulty)}>
                            {exercise.difficulty}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="aspect-video bg-muted rounded-md relative overflow-hidden">
                        {exercise.short_youtube_demo ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="rounded-full bg-white text-black border-0"
                              onClick={() => window.open(exercise.short_youtube_demo!, '_blank')}
                            >
                              <Youtube className="h-6 w-6" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <Dumbbell className="h-8 w-8 opacity-30" />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm">
                        {exercise.prime_mover_muscle && (
                          <p><span className="font-medium">Primary Muscle:</span> {exercise.prime_mover_muscle}</p>
                        )}
                        {exercise.mechanics && (
                          <p><span className="font-medium">Mechanics:</span> {exercise.mechanics}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex w-full gap-2">
                      <Button variant="default" className="flex-1">
                        <Info className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Add to Workout
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {[...Array(Math.min(5, Math.ceil(totalCount / ITEMS_PER_PAGE)))].map((_, i) => {
                  const pageNum = i;
                  return (
                    <Button 
                      key={i}
                      variant={currentPage === pageNum ? "default" : "outline"} 
                      className="w-10 h-10 p-0"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
              </div>
              <Button 
                variant="outline"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE) - 1 || exercises.length < ITEMS_PER_PAGE}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-4">
              No exercises found matching your criteria
            </p>
            <Button onClick={() => {
              setSearchQuery("");
              setSelectedMuscleGroup("all");
              setSelectedEquipment("all");
              setSelectedDifficulty("all");
            }} variant="outline">
              Reset Filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Edit Exercise Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
            <DialogDescription>
              Update the exercise details
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
              <Input 
                id="edit-name"
                name="name" 
                placeholder="Exercise name" 
                value={formState.name} 
                onChange={(e) => handleFormChange('name', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-muscle-group" className="text-sm font-medium">Target Muscle Group</label>
                <Input 
                  id="edit-muscle-group"
                  name="target_muscle_group"
                  list="edit-muscle-groups"
                  placeholder="Target muscle" 
                  value={formState.target_muscle_group} 
                  onChange={(e) => handleFormChange('target_muscle_group', e.target.value)}
                />
                <datalist id="edit-muscle-groups">
                  {muscleGroups.map(group => (
                    <option key={group} value={group} />
                  ))}
                </datalist>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-equipment" className="text-sm font-medium">Equipment</label>
                <Input 
                  id="edit-equipment"
                  name="primary_equipment"
                  list="edit-equipments"
                  placeholder="Equipment needed" 
                  value={formState.primary_equipment} 
                  onChange={(e) => handleFormChange('primary_equipment', e.target.value)}
                />
                <datalist id="edit-equipments">
                  {equipmentTypes.map(eq => (
                    <option key={eq} value={eq} />
                  ))}
                </datalist>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-difficulty" className="text-sm font-medium">Difficulty Level</label>
              <Select 
                name="difficulty"
                value={formState.difficulty} 
                onValueChange={(value) => handleFormChange('difficulty', value)}
              >
                <SelectTrigger id="edit-difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-video" className="text-sm font-medium">Video URL</label>
              <Input 
                id="edit-video"
                name="short_youtube_demo"
                placeholder="YouTube video URL" 
                value={formState.short_youtube_demo || ''} 
                onChange={(e) => handleFormChange('short_youtube_demo', e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditExercise}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this exercise? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentExercise && (
            <div className="py-4">
              <p className="font-medium">{currentExercise.name}</p>
              <div className="flex gap-2 mt-2">
                {currentExercise.target_muscle_group && (
                  <Badge variant="outline">{currentExercise.target_muscle_group}</Badge>
                )}
                {currentExercise.primary_equipment && (
                  <Badge variant="outline">{currentExercise.primary_equipment}</Badge>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteExercise}>Delete Exercise</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ExerciseLibraryEnhanced;
