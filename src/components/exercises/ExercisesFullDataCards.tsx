
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { ExerciseFull } from '@/types/exercise';
import ExerciseCardFull from './ExerciseCardFull';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ExercisesFullDataCardsProps {
  perPage?: number;
}

const ExercisesFullDataCards = ({ perPage = 9 }: ExercisesFullDataCardsProps) => {
  const [exercises, setExercises] = useState<ExerciseFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      
      try {
        // Fetch data with pagination
        const { data, error, count } = await supabase
          .from('exercises_full')
          .select('*', { count: 'exact' })
          .range(page * perPage, (page + 1) * perPage - 1)
          .order('name');
        
        if (error) throw error;
        
        // Map the data to include the required fields for ExerciseFull
        if (data) {
          const mappedData: ExerciseFull[] = data.map(item => ({
            ...item,
            target_muscle_group: item.prime_mover_muscle,
            video_demonstration_url: item.short_youtube_demo,
            video_explanation_url: item.in_depth_youtube_exp
          }));
          
          setExercises(mappedData);
          
          if (count) {
            setTotalCount(count);
            setTotalPages(Math.ceil(count / perPage));
          }
        }
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
        toast({
          title: "Error",
          description: "Failed to fetch exercises data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [page, perPage, toast]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const renderPageNumbers = () => {
    // For small number of pages, show all
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => (
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={page === i} 
            onClick={() => handlePageChange(i)}
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      ));
    }
    
    // For many pages, use ellipsis pattern
    const items = [];
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          isActive={page === 0} 
          onClick={() => handlePageChange(0)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Add ellipsis if needed
    if (page > 3) {
      items.push(
        <PaginationItem key="ellipsis1">
          <span className="flex h-9 w-9 items-center justify-center">...</span>
        </PaginationItem>
      );
    }
    
    // Add pages around current
    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages - 2, page + 1);
    
    for (let i = start; i <= end; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={page === i} 
            onClick={() => handlePageChange(i)}
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add ellipsis if needed
    if (page < totalPages - 4) {
      items.push(
        <PaginationItem key="ellipsis2">
          <span className="flex h-9 w-9 items-center justify-center">...</span>
        </PaginationItem>
      );
    }
    
    // Always show last page
    items.push(
      <PaginationItem key="last">
        <PaginationLink 
          isActive={page === totalPages - 1} 
          onClick={() => handlePageChange(totalPages - 1)}
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );
    
    return items;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Exercise Database</h2>
        <p className="text-muted-foreground">
          {loading ? 'Loading...' : 
           `Showing ${page * perPage + 1}-${Math.min((page + 1) * perPage, totalCount)} of ${totalCount} exercises`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: perPage }).map((_, i) => (
            <Skeleton key={i} className="h-[350px] w-full" />
          ))}
        </div>
      ) : exercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <ExerciseCardFull key={exercise.id} exercise={exercise} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-lg text-muted-foreground">No exercises found</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              {page === 0 ? (
                <PaginationPrevious className="pointer-events-none opacity-50" />
              ) : (
                <PaginationPrevious onClick={() => handlePageChange(Math.max(0, page - 1))} />
              )}
            </PaginationItem>
            
            {renderPageNumbers()}
            
            <PaginationItem>
              {page === totalPages - 1 ? (
                <PaginationNext className="pointer-events-none opacity-50" />
              ) : (
                <PaginationNext onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))} />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ExercisesFullDataCards;
