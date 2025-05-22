
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Exercise, ExerciseFull } from '@/types/exercise';
import { fetchExercisesFull, getMuscleGroups, getEquipmentTypes } from '@/hooks/exercise-library/services/exercise-fetch-service';
import ExerciseCard from '@/components/exercises/ExerciseCard';
import { ChevronLeft, Search } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function ExerciseLibraryEnhanced() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exercises, setExercises] = useState<ExerciseFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchFilterOptions();
    fetchExercises();
  }, [selectedMuscleGroup, selectedEquipment, selectedDifficulty]);

  const fetchFilterOptions = async () => {
    try {
      const muscleGroupsData = await getMuscleGroups();
      setMuscleGroups(muscleGroupsData);

      const equipmentData = await getEquipmentTypes();
      setEquipmentTypes(equipmentData);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const data = await fetchExercisesFull(100, 0);
      
      // Filter based on search query and selected filters
      let filteredData = data;
      
      if (searchQuery) {
        filteredData = filteredData.filter(ex => 
          ex.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (selectedMuscleGroup !== 'all') {
        filteredData = filteredData.filter(ex => 
          ex.prime_mover_muscle === selectedMuscleGroup
        );
      }
      
      if (selectedEquipment !== 'all') {
        filteredData = filteredData.filter(ex => 
          ex.primary_equipment === selectedEquipment
        );
      }
      
      if (selectedDifficulty !== 'all') {
        filteredData = filteredData.filter(ex => 
          ex.difficulty === selectedDifficulty
        );
      }
      
      setTotalCount(filteredData.length);
      
      // Paginate
      const startIdx = currentPage * ITEMS_PER_PAGE;
      const paginatedData = filteredData.slice(startIdx, startIdx + ITEMS_PER_PAGE);
      
      setExercises(paginatedData);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast({
        title: "Error",
        description: "Failed to load exercises",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const handleFilterChange = (type: string, value: string) => {
    setCurrentPage(0);
    
    switch (type) {
      case 'muscleGroup':
        setSelectedMuscleGroup(value);
        break;
      case 'equipment':
        setSelectedEquipment(value);
        break;
      case 'difficulty':
        setSelectedDifficulty(value);
        break;
      default:
        break;
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMuscleGroup('all');
    setSelectedEquipment('all');
    setSelectedDifficulty('all');
    setCurrentPage(0);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExercises();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, currentPage]);

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <AppLayout>
      <div className="bg-background min-h-screen text-foreground p-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackClick}
            className="gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Workouts
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search exercises by name"
            className="pl-10"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Button 
            variant="outline" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={handleResetFilters}
          >
            Reset Filters
          </Button>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Muscle Group</label>
            <Select
              value={selectedMuscleGroup}
              onValueChange={(value) => handleFilterChange('muscleGroup', value)}
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
          
          <div>
            <label className="block text-sm font-medium mb-1">Equipment</label>
            <Select
              value={selectedEquipment}
              onValueChange={(value) => handleFilterChange('equipment', value)}
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
          
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <Select
              value={selectedDifficulty}
              onValueChange={(value) => handleFilterChange('difficulty', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All difficulties</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mb-4 text-muted-foreground">
          Showing {exercises.length} exercises
          {totalCount > 0 ? ` (1-${Math.min(ITEMS_PER_PAGE, totalCount)} of ${totalCount})` : ''}
        </div>
        
        {/* Exercise grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner />
            <span className="ml-2">Loading exercises...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
            
            {exercises.length === 0 && (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                No exercises found matching your search criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
