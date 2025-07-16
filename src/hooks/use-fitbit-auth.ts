import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface FitbitAuthMessage {
  type: 'fitbit-auth-success' | 'fitbit-auth-error';
  code?: string;
  state?: any;
  provider: string;
  error?: string;
}

export function useFitbitAuth() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleMessage = useCallback((event: MessageEvent<FitbitAuthMessage>) => {
    // Only process messages from our own origin for security
    if (event.origin !== window.location.origin) return;

    const { type, error, state } = event.data;

    if (type === 'fitbit-auth-success') {
      setIsAuthenticating(false);
      setAuthError(null);
      
      // Show success message
      toast({
        title: 'Success!',
        description: 'Successfully connected your Fitbit account.',
        variant: 'default',
      });

      // If we have a return URL in state, navigate there
      if (state?.returnUrl) {
        router.push(state.returnUrl);
      } else {
        // Default to refreshing the page to show updated data
        window.location.reload();
      }
      
      // Close the popup if we're in one
      if (window.opener) {
        window.close();
      }
    } 
    else if (type === 'fitbit-auth-error') {
      setIsAuthenticating(false);
      const errorMessage = error || 'Failed to connect Fitbit account';
      setAuthError(errorMessage);
      
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [router, toast]);

  useEffect(() => {
    // Add event listener for messages from the OAuth popup
    window.addEventListener('message', handleMessage);
    
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  return {
    isAuthenticating,
    authError,
    setIsAuthenticating,
  };
}
