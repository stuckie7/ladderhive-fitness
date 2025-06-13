import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function TestSupabase() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true);
        console.log('Testing Supabase connection...');
        
        // Test a simple query to a public table
        const { data: testData, error: testError } = await supabase
          .from('forum_categories')
          .select('*')
          .limit(1);

        if (testError) throw testError;
        
        console.log('Connection successful!', testData);
        setData(testData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Connection error:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Testing Supabase connection...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Connection Error</p>
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Please check your Supabase configuration and ensure the database is properly set up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Supabase Connection Test</h2>
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        Successfully connected to Supabase!
      </div>
      <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
        <h3 className="font-medium mb-2">Test Data:</h3>
        <pre className="text-sm bg-white p-2 rounded border border-gray-200 overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
