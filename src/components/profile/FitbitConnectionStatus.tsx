import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { HeartPulse, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const FitbitConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const checkConnection = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsConnected(false);
        return;
      }

      const { data, error } = await supabase
        .from('fitbit_tokens')
        .select('expires_at')
        .eq('user_id', session.user.id)
        .single();

      if (error || !data) {
        setIsConnected(false);
        return;
      }

      // Check if token is expired
      const isExpired = new Date(data.expires_at * 1000) < new Date();
      setIsConnected(!isExpired);
    } catch (error) {
      console.error('Error checking Fitbit connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const response = await fetch('/api/fitbit/connect');
      
      if (!response.ok) {
        throw new Error('Failed to initiate Fitbit connection');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error connecting Fitbit:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to Fitbit. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HeartPulse className="h-5 w-5 text-pink-500" />
          <span className="font-medium">Fitbit Connection</span>
        </div>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <span className="inline-flex items-center text-sm text-green-600">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Connected
            </span>
          ) : (
            <Button 
              size="sm" 
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Fitbit'
              )}
            </Button>
          )}
        </div>
      </div>
      
      {!isConnected && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Not Connected</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Connect your Fitbit account to track your fitness activities and health metrics.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isConnected && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Connected</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your Fitbit account is successfully connected. Your activities will be synced automatically.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitbitConnectionStatus;
