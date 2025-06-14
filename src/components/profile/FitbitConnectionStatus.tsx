
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
      const isExpired = new Date(data.expires_at) < new Date();
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
      
      console.log('Initiating Fitbit connection...');
      
      // Create authorization URL directly
      const fitbitClientId = '23QJQ3';
      const redirectUri = `${window.location.origin.includes('localhost') ? 'https://jrwyptpespjvjisrwnbh.supabase.co' : window.location.origin}/functions/v1/fitbit-callback`;
      const state = crypto.randomUUID();
      
      const authParams = new URLSearchParams({
        response_type: 'code',
        client_id: fitbitClientId,
        redirect_uri: redirectUri,
        scope: 'activity heartrate location nutrition profile settings sleep social weight',
        state: state,
        expires_in: '604800'
      });

      const authUrl = `https://www.fitbit.com/oauth2/authorize?${authParams.toString()}`;
      
      console.log('Redirecting to Fitbit authorization:', authUrl);
      window.location.href = authUrl;
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { error } = await supabase
        .from('fitbit_tokens')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;

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
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const expiresIn = urlParams.get('expires_in');
    
    if (fitbitConnected === 'true' && accessToken && refreshToken && expiresIn) {
      // Store tokens in database
      const storeTokens = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const expiresAt = new Date(Date.now() + (parseInt(expiresIn) * 1000));
          
          const { error } = await supabase
            .from('fitbit_tokens')
            .upsert({
              user_id: session.user.id,
              access_token: accessToken,
              refresh_token: refreshToken,
              expires_at: expiresAt.toISOString(),
              scope: 'activity heartrate location nutrition profile settings sleep social weight'
            });

          if (error) {
            console.error('Error storing tokens:', error);
          } else {
            setIsConnected(true);
            toast({
              title: 'Connected!',
              description: 'Your Fitbit account has been successfully connected.',
            });
          }
        } catch (error) {
          console.error('Error storing tokens:', error);
        }
      };

      storeTokens();
      
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
