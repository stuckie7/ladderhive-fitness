
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Exercise } from '@/types/exercise';
import { supabase } from '@/integrations/supabase/client';

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const itemsPerPage = 12;
  const { toast } = useToast();

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('exercises_full')
          .select('*')
          .range(page * itemsPerPage, (page + 1) * itemsPerPage - 1)
          .order('name');
          
        if (error) {
          throw error;
        }
        
        setExercises(data || []);
      } catch (err: any) {
        console.error("Error fetching exercises:", err);
        setError(err.message || "Failed to fetch exercises");
        toast({
          title: "Error",
          description: "There was a problem fetching exercises.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, [page, toast]);

  return { 
    exercises, 
    loading, 
    error,
    page,
    setPage,
    itemsPerPage 
  };
};
