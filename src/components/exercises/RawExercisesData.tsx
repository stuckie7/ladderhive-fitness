import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';

// Define proper TypeScript interface for your data
interface Exercise {
  id: number;
  // Add other fields from your exercises_full table
  // For example:
  name?: string;
  description?: string;
  [key: string]: any; // For additional unknown fields
}

const RawExercisesData = () => {
  const [data, setData] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to memoize the fetch function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state before new fetch attempt
      console.info("Fetching exercises with limit 10 and offset 0");
      
      // Add timeout to handle potential hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out after 10s")), 10000)
      );
      
      const fetchPromise = supabase
        .from('exercises_full')
        .select('*')
        .limit(10);
      
      // Race between the fetch and the timeout
      const result = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any;

      // Check for Supabase-specific error
      if (result.error) {
        throw new Error(`Supabase error: ${result.error.message || result.error.details || JSON.stringify(result.error)}`);
      }
      
      const exercisesData = result.data;
      
      console.info(`Fetched ${exercisesData?.length || 0} exercises from exercises_full`);
      
      if (!exercisesData || !Array.isArray(exercisesData)) {
        throw new Error("Invalid data format returned from Supabase");
      }
      
      setData(exercisesData);
    } catch (err: any) {
      console.error("Error fetching raw exercises data:", err);
      // Provide more detailed error information
      const errorMessage = err.message || "Failed to fetch exercises data";
      setError(`${errorMessage}${err.code ? ` (Code: ${err.code})` : ''}`);
      // Set empty data array on error to prevent undefined issues
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch data once when the component mounts
  useEffect(() => {
    fetchData();
    
    // Optional: Add a cleanup function
    return () => {
      // Cancel any pending operations if needed
    };
  }, [fetchData]); // fetchData is memoized so this won't cause re-renders

  const retry = () => {
    fetchData();
  };

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
        <p className="mb-2">{error}</p>
        <button 
          onClick={retry}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-md overflow-hidden">
      <h3 className="font-semibold mb-2">Raw Data: exercises_full (first 10 rows)</h3>
      {data.length === 0 ? (
        <p className="text-gray-500 italic">No data found</p>
      ) : (
        <div className="overflow-x-auto">
          <pre className="text-xs bg-muted/10 p-2 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default RawExercisesData;
