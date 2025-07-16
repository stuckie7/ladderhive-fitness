import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { handleOAuthCallback } from '@/utils/oauth';
import { Loader2 } from 'lucide-react';

export default function FitbitCallback() {
  const router = useRouter();

  useEffect(() => {
    // Handle the OAuth callback
    handleOAuthCallback();
    
    // This will close the popup and send the result back to the parent window
    // The parent window will handle the redirection
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-800">Completing Fitbit Connection</h1>
        <p className="mt-2 text-gray-600">Please wait while we connect your Fitbit account...</p>
      </div>
    </div>
  );
}

// This page should not be pre-rendered
FitbitCallback.getInitialProps = async () => ({});
