'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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

  const handleLogin = () => {
    try {
      setIsLoading(true);
      
      // Open Fitbit OAuth in a new tab
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      window.open(
        '/api/auth/fitbit',
        'FitbitAuth',
        `width=${width},height=${height},top=${top},left=${left}`
      );
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
