import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FitbitLoginButton } from '@/components/auth/FitbitLoginButton';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function FitbitTest() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fitbitData, setFitbitData] = useState<any>(null);

  // Check if user is connected to Fitbit
  const checkFitbitConnection = async () => {
    if (!user) {
      setIsConnected(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('fitbit_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError || !data) {
        setIsConnected(false);
      } else {
        setIsConnected(true);
        setFitbitData(data);
      }
    } catch (err) {
      console.error('Error checking Fitbit connection:', err);
      setError('Failed to check Fitbit connection');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check connection on component mount and when user changes
  useEffect(() => {
    checkFitbitConnection();
  }, [user]);

  const handleSuccess = () => {
    console.log('Fitbit connection successful!');
    checkFitbitConnection();
  };

  const handleError = (error: Error) => {
    console.error('Fitbit connection error:', error);
    setError(error.message);
  };

  const handleDisconnect = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('fitbit_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      setIsConnected(false);
      setFitbitData(null);
    } catch (err) {
      console.error('Error disconnecting Fitbit:', err);
      setError('Failed to disconnect Fitbit');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Fitbit Integration Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        
        {isConnected ? (
          <div>
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Connected to Fitbit</span>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Connection Details:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(fitbitData, null, 2)}
              </pre>
            </div>
            
            <Button 
              onClick={handleDisconnect}
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect Fitbit'}
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="mb-4">You are not connected to Fitbit</p>
            <FitbitLoginButton 
              onSuccess={handleSuccess}
              onError={handleError}
              className="mx-auto"
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Test Data</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">User Info:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {user ? JSON.stringify({
                id: user.id,
                email: user.email,
                // Add other user properties as needed
              }, null, 2) : 'Not logged in'}
            </pre>
          </div>
          
          {isConnected && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Fitbit Profile</h3>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={checkFitbitConnection}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <div className="bg-gray-100 p-3 rounded text-sm">
                {fitbitData ? (
                  <pre>{JSON.stringify(fitbitData, null, 2)}</pre>
                ) : (
                  'No Fitbit data available'
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
