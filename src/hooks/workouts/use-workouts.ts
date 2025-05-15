
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('prepared_workouts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setWorkouts(data || []);
        
      } catch (err: any) {
        console.error('Error fetching workouts:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: `Failed to load workouts: ${err.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, [toast]);

  return { workouts, isLoading, error };
};
