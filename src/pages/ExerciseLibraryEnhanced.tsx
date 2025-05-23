
import { useState, useEffect, useCallback } from 'react';
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
import ExercisePagination from '@/components/exercises/ExercisePagination';

export default function ExerciseLibraryEnhanced() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exercises, setExercises] = useState<ExerciseFull[]>([]);
  const [allExercises, setAllExercises] = useState<ExerciseFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  
  // Pagination state - persist in localStorage
  const [pagination, setPagination] = useState(() => {
    const savedPagination = localStorage.getItem('enhancedExercisePagination');
    if (savedPagination) {
      try {
        return JSON.parse(savedPagination);
      } catch (e) {
        console.error('Error parsing saved pagination', e);
      }
    }
    return {
      currentPage: 1,
      itemsPerPage: 24,
      totalItems: 0,
      totalPages: 1,
    };
  });

  // Save pagination settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('enhancedExercisePagination', JSON.stringify(pagination));
  }, [pagination]);

  useEffect(() => {
    fetchFilterOptions();
    fetchExercises();
  }, []);

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
      // Load all exercises at once, then apply pagination client-side
      const data = await fetchExercisesFull(1000, 0);
      setAllExercises(data);
      
      // Update pagination info
      setPagination(prev => ({
        ...prev,
        totalItems: data.length,
        totalPages: Math.ceil(data.length / prev.itemsPerPage),
      }));
      
      applyFiltersAndPagination(data);
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

  const applyFiltersAndPagination = useCallback((data = allExercises) => {
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
    
    // Update pagination totals
    setPagination(prev => ({
      ...prev,
      totalItems: filteredData.length,
      totalPages: Math.max(1, Math.ceil(filteredData.length / prev.itemsPerPage)),
      currentPage: Math.min(prev.currentPage, Math.ceil(filteredData.length / prev.itemsPerPage) || 1)
    }));
    
    // Apply pagination
    const startIdx = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const paginatedData = filteredData.slice(startIdx, startIdx + pagination.itemsPerPage);
    
    setExercises(paginatedData);
  }, [allExercises, searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, pagination.currentPage, pagination.itemsPerPage]);

  useEffect(() => {
    applyFiltersAndPagination();
  }, [applyFiltersAndPagination]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleFilterChange = (type: string, value: string) => {
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
    
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
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => {
      const newTotalPages = Math.ceil(prev.totalItems / pageSize);
      return {
        ...prev,
        itemsPerPage: pageSize,
        totalPages: newTotalPages,
        currentPage: Math.min(prev.currentPage, newTotalPages)
      };
    });
  };

  // Apply debounce to search
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFiltersAndPagination();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, applyFiltersAndPagination]);

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
        
        {/* Exercise grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner />
            <span className="ml-2">Loading exercises...</span>
          </div>
        ) : (
          <>
            {exercises.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exercises.map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No exercises found matching your search criteria.
              </div>
            )}
            
            {/* Enhanced pagination component */}
            {pagination.totalItems > 0 && (
              <ExercisePagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                pageSize={pagination.itemsPerPage}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                className="mt-8"
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
