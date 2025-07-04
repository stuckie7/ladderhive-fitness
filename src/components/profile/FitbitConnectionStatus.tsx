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
      
      // First, check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setIsConnected(false);
        return;
      }

      if (!session?.user) {
        console.log('No authenticated user found');
        setIsConnected(false);
        return;
      }

      console.log('Checking Fitbit connection for user:', session.user.id);

      // Invoke the edge function with auth header so Supabase Edge Function can authenticate the user
      const { error } = await supabase.functions.invoke('get-fitbit-profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.log('Fitbit not connected or token invalid:', error.message);
        setIsConnected(false);
        return;
      }

      // If the function returns successfully, the user is connected.
      console.log('Fitbit connection confirmed.');
      setIsConnected(true);
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
      
      // Verify authentication before attempting connection
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to connect your Fitbit account.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Initiating Fitbit connection...');
      
      // Get the authorization URL from our edge function with proper auth header
      const { data, error } = await supabase.functions.invoke('fitbit-oauth', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to get authorization URL');
      }
      
      if (!data?.url) {
        throw new Error('No authorization URL returned');
      }
      
      console.log('Opening Fitbit authorization in new window:', data.url);
      
      // Open in a new window/tab to avoid iframe restrictions
      const newWindow = window.open(data.url, 'fitbit-auth', 'width=600,height=700,scrollbars=yes,resizable=yes');
      
      if (!newWindow) {
        throw new Error('Failed to open authorization window. Please allow popups for this site.');
      }
      
      // Listen for the window to close (user completed or cancelled auth)
      const checkClosed = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkClosed);
          // Check connection status after window closes
          setTimeout(() => {
            checkConnection();
          }, 1000);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error connecting Fitbit:', error);
      toast({
        title: 'Connection Error',
        description: error instanceof Error ? error.message : 'Failed to connect to Fitbit. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        toast({
          title: 'Authentication Error',
          description: 'Unable to verify authentication.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('fitbit_tokens')
        .delete()
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error disconnecting Fitbit:', error);
        toast({
          title: 'Error',
          description: 'Failed to disconnect Fitbit account.',
          variant: 'destructive',
        });
        return;
      }

      setIsConnected(false);
      toast({
        title: 'Disconnected',
        description: 'Your Fitbit account has been disconnected.',
      });
    } catch (error) {
      console.error('Error disconnecting Fitbit:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect Fitbit account.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();

    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const fitbitConnected = urlParams.get('fitbit_connected');
    const error = urlParams.get('error');
    
    if (fitbitConnected === 'true') {
      setIsConnected(true);
      toast({
        title: 'Connected!',
        description: 'Your Fitbit account has been successfully connected.',
      });
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (error) {
      console.error('Fitbit connection error:', error);
      toast({
        title: 'Connection Error',
        description: decodeURIComponent(error),
        variant: 'destructive',
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

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
            <>
              <span className="inline-flex items-center text-sm text-green-600">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Connected
              </span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleDisconnect}
                disabled={isLoading}
              >
                Disconnect
              </Button>
            </>
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
