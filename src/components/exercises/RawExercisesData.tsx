
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';

const RawExercisesData = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to memoize the fetch function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.info("Fetching exercises with limit 10 and offset 0");
      
      const { data: exercisesData, error } = await supabase
        .from('exercises_full')
        .select('*')
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      console.info(`Fetched ${exercisesData?.length || 0} exercises from exercises_full (total count: unknown)`);
      setData(exercisesData || []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching raw exercises data:", err);
      setError(err.message || "Failed to fetch exercises data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch data once when the component mounts
  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData is memoized, so this won't cause re-renders

  if (loading) {
    return (
      <div className="p-4 border rounded-md bg-muted/20">
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Spinner />
            <span>Loading Supabase exercises_full...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-800">
        <h3 className="font-medium">Error loading data</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-md overflow-hidden">
      <h3 className="font-semibold mb-2">Raw Data: exercises_full (first 10 rows)</h3>
      <div className="overflow-x-auto">
        <pre className="text-xs bg-muted/10 p-2 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default RawExercisesData;
