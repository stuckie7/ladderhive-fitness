import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';

const RawExercisesData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use useCallback to memoize the fetch function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      console.info("Fetching exercises with limit 10 and offset 0");
      
      // Check if supabase client is properly initialized
      if (!supabase) {
        throw new Error("Supabase client is not initialized");
      }
      
      // Log supabase connection status for debugging
      console.log("Supabase client:", supabase);
      
      // Try a basic query first to test connection
      const { error: pingError } = await supabase.from('exercises_full').select('count', { count: 'exact', head: true });
      
      if (pingError) {
        console.error("Connection test failed:", pingError);
        throw new Error(`Database connection error: ${pingError.message || pingError.details}`);
      }
      
      // Main data query with timeout protection
      const fetchPromise = new Promise(async (resolve, reject) => {
        try {
          const result = await supabase
            .from('exercises_full')
            .select('*')
            .limit(10);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out after 8 seconds")), 8000)
      );
      
      // Race the fetch against the timeout
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      const { data: exercisesData, error: queryError } = result;
      
      if (queryError) {
        console.error("Query error details:", queryError);
        throw queryError;
      }
      
      console.info(`Fetched ${exercisesData?.length || 0} exercises from exercises_full`);
      
      // Validate the data structure
      if (!exercisesData) {
        throw new Error("No data returned from query");
      }
      
      setData(exercisesData);
    } catch (err) {
      console.error("Error fetching raw exercises data:", err);
      
      // Handle different error types
      let errorMessage = "Failed to fetch exercises data";
      
      if (err.code === "PGRST301") {
        errorMessage = "Database permission error. Check RLS policies.";
      } else if (err.code === "PGRST116") {
        errorMessage = "The table 'exercises_full' does not exist.";
      } else if (err.code === "20") {
        errorMessage = "Database connection error. Check your API keys.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch data once when the component mounts
  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData is memoized so this won't cause re-renders

  const handleRetry = () => {
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
        <p className="mb-3">{error}</p>
        <button 
          onClick={handleRetry}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm transition"
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
        <p className="text-gray-500 italic">No data found in exercises_full table</p>
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
