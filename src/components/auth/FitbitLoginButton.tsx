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
      
      // Store the current URL to return to after auth
      const returnUrl = window.location.pathname + window.location.search;
      localStorage.setItem('fitbit_return_url', returnUrl);
      
      // For Mobstead environment, we'll open in a new tab instead of a popup
      const isMobstead = window.self !== window.top; // Check if we're in an iframe
      
      if (isMobstead || window.innerWidth < 768) {
        // In Mobstead or mobile, open in a new tab
        const url = `${window.location.origin}/api/auth/fitbit`;
        window.open(url, '_blank');
      } else {
        // In regular desktop browser, open in a popup
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          '/api/auth/fitbit',
          'FitbitAuth',
          `width=${width},height=${height},top=${top},left=${left}`
        );
        
        // Check if popup was blocked
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          // Popup was blocked, fall back to new tab
          window.open('/api/auth/fitbit', '_blank');
        }
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
