import { useState, useEffect } from 'react';
import { useExercisesFull } from '@/hooks/exercise-library/hooks/use-exercises-full';
import { ExerciseFull } from '@/types/exercise';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Search, Filter, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { loadExerciseData } from '@/hooks/exercise-library/services/exercise-enhanced-service';
import { supabase } from '@/lib/supabase';

const ExercisesFullList = () => {
  const [exercises, setExercises] = useState<ExerciseFull[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use our hook for basic functionality
  const exerciseHook = useExercisesFull();

  // Define direct data fetching methods since they're missing from the hook
  const fetchExercisesFull = async (limit = 20, offset = 0): Promise<ExerciseFull[]> => {
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Ensure proper type conversion - convert number IDs to strings
      return (data || []).map(item => ({
        ...item,
        id: String(item.id) // Convert ID to string
      })) as ExerciseFull[];
    } catch (err) {
      console.error('Error fetching exercises:', err);
      return [];
    }
  };

  const getMuscleGroups = async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('prime_mover_muscle')
        .not('prime_mover_muscle', 'is', null);

      if (error) throw error;
      
      // Extract unique muscle groups
      const muscleGroups = Array.from(
        new Set(data.map(item => item.prime_mover_muscle).filter(Boolean))
      );
      
      return muscleGroups.sort();
    } catch (err) {
      console.error('Error fetching muscle groups:', err);
      return [];
    }
  };

  const getEquipmentTypes = async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('primary_equipment')
        .not('primary_equipment', 'is', null);

      if (error) throw error;
      
      // Extract unique equipment types
      const equipmentTypes = Array.from(
        new Set(data.map(item => item.primary_equipment).filter(Boolean))
      );
      
      return equipmentTypes.sort();
    } catch (err) {
      console.error('Error fetching equipment types:', err);
      return [];
    }
  };

  const searchExercisesFull = async (query: string): Promise<ExerciseFull[]> => {
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(20);

      if (error) throw error;
      
      // Ensure proper type conversion - convert number IDs to strings
      return (data || []).map(item => ({
        ...item,
        id: String(item.id) // Convert ID to string
      })) as ExerciseFull[];
    } catch (err) {
      console.error('Error searching exercises:', err);
      return [];
    }
  };

  const loadExercises = async () => {
    setIsLoading(true);
    const data = await fetchExercisesFull(20, page * 20);
    setExercises(data);
    setIsLoading(false);
  };

  const loadFilters = async () => {
    const loadedMuscleGroups = await getMuscleGroups();
    const loadedEquipmentTypes = await getEquipmentTypes();
    setMuscleGroups(loadedMuscleGroups);
    setEquipmentTypes(loadedEquipmentTypes);
  };

  useEffect(() => {
    loadExercises();
    loadFilters();
  }, [page]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchExercisesFull(searchQuery);
      setExercises(results);
    } else {
      loadExercises();
    }
  };

  const filterExercises = (exercises: ExerciseFull[]) => {
    return exercises.filter(exercise => {
      const matchesMuscleGroup = selectedMuscleGroup === 'all' || 
        exercise.target_muscle_group === selectedMuscleGroup;
      
      const matchesEquipment = selectedEquipment === 'all' || 
        exercise.primary_equipment === selectedEquipment;
      
      return matchesMuscleGroup && matchesEquipment;
    });
  };

  const displayedExercises = filterExercises(exercises);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Advanced Exercise Library</h1>
      
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Muscle Group</label>
            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
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
            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
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
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : displayedExercises.length > 0 ? (
        <>
          <p className="mb-4 text-muted-foreground">
            Showing {displayedExercises.length} exercises
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedExercises.map((exercise) => (
              <Card key={exercise.id} className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
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
                        <Badge className={`
                          ${exercise.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                          ${exercise.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                          ${exercise.difficulty === 'Advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : ''}
                        `}>
                          {exercise.difficulty}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm">
                      {exercise.prime_mover_muscle && (
                        <p><span className="font-medium">Primary Muscle:</span> {exercise.prime_mover_muscle}</p>
                      )}
                      {exercise.mechanics && (
                        <p><span className="font-medium">Mechanics:</span> {exercise.mechanics}</p>
                      )}
                      {exercise.body_region && (
                        <p><span className="font-medium">Body Region:</span> {exercise.body_region}</p>
                      )}
                    </div>
                    
                    {exercise.short_youtube_demo && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2" 
                        onClick={() => window.open(exercise.short_youtube_demo!, '_blank')}
                      >
                        <Youtube className="h-4 w-4 mr-2" />
                        Watch Demo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="py-2">Page {page + 1}</span>
            <Button 
              variant="outline" 
              onClick={() => setPage(p => p + 1)}
              disabled={displayedExercises.length < 20}
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
            setSearchQuery('');
            setSelectedMuscleGroup('all');
            setSelectedEquipment('all');
            loadExercises();
          }} variant="outline">
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExercisesFullList;
