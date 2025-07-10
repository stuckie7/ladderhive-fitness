'use client';

import { useRouter } from 'next/navigation';
import { openOAuthPopup, handleOAuthCallback } from '../utils/auth';

export default function FitbitLoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const popup = openOAuthPopup('/api/auth/fitbit', 'FitbitAuth');
      
      handleOAuthCallback(
        popup,
        () => {
          router.refresh();
        },
        (error) => {
          console.error('Authentication error:', error);
          alert('Failed to authenticate with Fitbit. Please try again.');
        }
      );
    } catch (error) {
      console.error('Failed to open popup:', error);
      alert('Failed to open authentication window. Please allow popups for this site.');
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
    >
      Connect with Fitbit
    </button>
  );
}
