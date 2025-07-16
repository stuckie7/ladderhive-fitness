'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FitbitLoginButtonProps {
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function FitbitLoginButton({ 
  className = '',
  onSuccess,
  onError 
}: FitbitLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Store the current URL to return to after auth
      const returnUrl = window.location.pathname + window.location.search;
      localStorage.setItem('fitbit_return_url', returnUrl);
      
      // Call the edge function to initiate Fitbit OAuth
      const { data, error } = await supabase.functions.invoke('fitbit-initiate');
      
      if (error) {
        console.error('Error initiating Fitbit auth:', error);
        onError?.(new Error('Failed to start Fitbit authentication'));
        setIsLoading(false);
        return;
      }
      
      if (data?.authUrl) {
        // Open the Fitbit authorization URL in a new window
        window.open(data.authUrl, '_blank');
        
        // Set a timer to check if we need to handle the auth status
        // This is a fallback in case the message event doesn't fire
        const authCheck = setInterval(() => {
          // Check if we have a success indicator in localStorage
          const authStatus = localStorage.getItem('fitbit_auth_status');
          if (authStatus === 'success') {
            localStorage.removeItem('fitbit_auth_status');
            clearInterval(authCheck);
            setIsLoading(false);
            onSuccess?.();
          } else if (authStatus === 'error') {
            localStorage.removeItem('fitbit_auth_status');
            clearInterval(authCheck);
            setIsLoading(false);
            onError?.(new Error('Authentication failed'));
          }
        }, 1000);
        
        // Clear the interval after 5 minutes
        setTimeout(() => {
          clearInterval(authCheck);
          setIsLoading(false);
        }, 5 * 60 * 1000);
      } else {
        console.error('No authUrl returned from fitbit-initiate');
        onError?.(new Error('Invalid authentication response'));
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Failed to open Fitbit login:', error);
      onError?.(error as Error);
      setIsLoading(false);
    }
  };

  // Listen for messages from the popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'FITBIT_AUTH_SUCCESS') {
        window.focus();
        onSuccess?.();
      } else if (event.data?.type === 'FITBIT_AUTH_ERROR') {
        onError?.(new Error(event.data.error || 'Failed to authenticate with Fitbit'));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onError]);

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      className={`bg-orange-500 hover:bg-orange-600 text-white ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        'Connect with Fitbit'
      )}
    </Button>
  );
}
