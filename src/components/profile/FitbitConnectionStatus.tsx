import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { HeartPulse, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { startOAuthFlow } from '@/utils/oauth';

type ToastVariant = 'default' | 'destructive';

interface ToastParams {
  title: string;
  description: string;
  variant?: ToastVariant;
}

const FitbitConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  
  // Memoize the showToast function to prevent unnecessary re-renders
  const showToast = useCallback(({ title, description, variant }: ToastParams) => {
    toast({
      title,
      description,
      variant,
    });
  }, [toast]);

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

      const { data, error } = await supabase
        .from('fitbit_tokens')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking Fitbit connection:', error);
        setIsConnected(false);
        return;
      }

      setIsConnected(!!data);
    } catch (error) {
      console.error('Error checking Fitbit connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = useCallback(async () => {
    try {
      setIsConnecting(true);
      
      // Verify authentication before attempting connection
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        showToast({
          title: 'Authentication Required',
          description: 'Please log in to connect your Fitbit account.',
          variant: 'destructive' as const
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
      
      // Start the OAuth flow with a popup
      startOAuthFlow(
        data.url,
        async () => {
          // This will be called when OAuth flow completes successfully
          try {
            // The callback should have already handled the token exchange
            // Just refresh the connection status
            await checkConnection();
            showToast({
              title: 'Success',
              description: 'Successfully connected to Fitbit!'
            });
          } catch (error: unknown) {
            console.error('Error after OAuth:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to complete Fitbit connection';
            showToast({
              title: 'Error',
              description: errorMessage,
              variant: 'destructive'
            });
          } finally {
            setIsConnecting(false);
          }
        },
        (error) => {
          // Handle errors
          console.error('OAuth error:', error);
          if (error.message !== 'Authentication was cancelled') {
            showToast({
              title: 'Error',
              description: error.message || 'Failed to connect to Fitbit',
              variant: 'destructive'
            });
          }
          setIsConnecting(false);
        }
      );
    } catch (error: any) {
      console.error('Error initiating Fitbit connection:', error);
      showToast({
        title: 'Error',
        description: error.message || 'Failed to connect to Fitbit',
        variant: 'destructive'
      });
      setIsConnecting(false);
    }
  }, [toast]);

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        showToast({
          title: 'Authentication Error',
          description: 'Unable to verify authentication.',
          variant: 'destructive' as const
        });
        return;
      }

      const { error } = await supabase
        .from('fitbit_tokens')
        .delete()
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error disconnecting Fitbit:', error);
        showToast({
          title: 'Error',
          description: 'Failed to disconnect Fitbit account.',
          variant: 'destructive'
        });
        return;
      }

      setIsConnected(false);
      showToast({
        title: 'Disconnected',
        description: 'Your Fitbit account has been disconnected.'
      });
    } catch (error) {
      console.error('Error disconnecting Fitbit:', error);
      showToast({
        title: 'Error',
        description: 'Failed to disconnect Fitbit account.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    const handleMessage = (event: MessageEvent) => {
      // Only process messages from our own origin
      if (event.origin !== window.location.origin) return;
      
      const { type, data, error } = event.data || {};
      
      if (type === 'oauth_callback') {
        if (error) {
          console.error('Fitbit connection error:', error);
          showToast({
            title: 'Connection Error',
            description: error.message || 'Failed to connect to Fitbit',
            variant: 'destructive' as const
          });
          setIsConnecting(false);
        } else if (data?.success) {
          setIsConnected(true);
          setIsConnecting(false);
          showToast({
            title: 'Connected!',
            description: 'Your Fitbit account has been successfully connected.'
          });
        }
      }
    };
    
    // Add event listener for messages from the popup
    window.addEventListener('message', handleMessage);
    
    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [toast, checkConnection, showToast]);

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
