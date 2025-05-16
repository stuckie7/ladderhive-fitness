import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';

const RawExercisesData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use refs to track component mount state and prevent race conditions
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;
  
  // Debounce loading state changes to prevent flickering
  const setLoadingDebounced = (isLoading) => {
    if (!isLoading) {
      // When turning off loading, do it immediately
      setLoading(false);
    } else if (isLoading && !loading) {
      // When turning on loading, delay slightly to prevent quick flickers
      setTimeout(() => {
        if (isMounted.current) {
          setLoading(true);
        }
      }, 200);
    }
  };

  // Safer state updates that check component is still mounted
  const safeSetState = (stateSetter, newValue) => {
    if (isMounted.current) {
      stateSetter(newValue);
    }
  };

  const fetchData = async () => {
    // Prevent concurrent fetches
    if (fetchInProgress.current) {
      return;
    }
    
    fetchInProgress.current = true;
    
    try {
      // Only show loading if it will take some time
      // Don't change loading state if we already have data (to prevent flickering)
      if (data.length === 0) {
        setLoadingDebounced(true);
      }
      
      console.info(`Fetching exercises (attempt ${retryCount.current + 1}/${MAX_RETRIES + 1})`);
      
      const { data: exercisesData, error: fetchError } = await supabase
        .from('exercises_full')
        .select('*')
        .limit(10);
      
      // Handle possible race condition - check if component still mounted
      if (!isMounted.current) return;
      
      if (fetchError) {
        console.error("Fetch error:", fetchError);
        throw fetchError;
      }
      
      // Only update state if we got new data
      if (exercisesData && Array.isArray(exercisesData)) {
        console.info(`Successfully fetched ${exercisesData.length} exercises`);
        safeSetState(setData, exercisesData);
        safeSetState(setError, null);
        retryCount.current = 0; // Reset retry counter on success
      } else {
        throw new Error("No data received from database");
      }
    } catch (err) {
      console.error("Error in fetch:", err);
      
      // Only update error state if component is mounted
      if (isMounted.current) {
        const errorMessage = err.message || "Failed to fetch data";
        safeSetState(setError, errorMessage);
        
        // Auto-retry logic for certain errors (but not too many times)
        if (retryCount.current < MAX_RETRIES && 
            !errorMessage.includes("permission") && 
            !errorMessage.includes("does not exist")) {
          retryCount.current += 1;
          console.log(`Auto-retrying in 2 seconds... (${retryCount.current}/${MAX_RETRIES})`);
          
          setTimeout(() => {
            if (isMounted.current) {
              fetchInProgress.current = false;
              fetchData();
            }
          }, 2000);
        }
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMounted.current) {
        fetchInProgress.current = false;
        
        // If we have data, don't flash loading state for auto-retries
        if (!(retryCount.current > 0 && data.length > 0)) {
          setLoadingDebounced(false);
        }
      }
    }
  };

  // Effect for initial data fetch and cleanup
  useEffect(() => {
    // Set up mounted ref
    isMounted.current = true;
    
    // Initial fetch
    fetchData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency array means this only runs once on mount

  const handleRetry = () => {
    retryCount.current = 0; // Reset retry counter for manual retry
    fetchData();
  };

  // Conditional rendering based on state
  if (loading && data.length === 0) {
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

  if (error && data.length === 0) {
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
