import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

declare global {
  interface Window {
    deferredPrompt: any;
  }
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('BeforeInstallPrompt event fired');
      // Prevent the default browser install prompt
      e.preventDefault();
      
      // Store the event for later use
      window.deferredPrompt = e;
      
      // Show our custom install button if not in Mobsted PWA
      if (!window.navigator.userAgent.includes('Mobsted')) {
        setIsVisible(true);
      } else {
        // If in Mobsted, let Mobsted handle the prompt
        console.log('Running in Mobsted PWA, letting Mobsted handle the prompt');
      }
    };

    // Only add the event listener if not in Mobsted PWA
    if (!window.navigator.userAgent.includes('Mobsted')) {
      console.log('Adding beforeinstallprompt event listener');
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    // Clean up the event listener
    return () => {
      if (!window.navigator.userAgent.includes('Mobsted')) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (window.deferredPrompt) {
      console.log('Showing install prompt');
      try {
        // Show the browser's install prompt
        window.deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await window.deferredPrompt.userChoice;
        
        // Log the user's response
        console.log(`User response to the install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, throw it away
        window.deferredPrompt = null;
        
        // Hide our custom install button
        setIsVisible(false);
        
        // Show a success message
        if (outcome === 'accepted') {
          toast({
            title: 'App installed successfully!',
            description: 'Thank you for installing our app!',
          });
        }
      } catch (error) {
        console.error('Error showing install prompt:', error);
      }
    } else {
      console.log('No deferredPrompt available');
      // If no deferredPrompt, just hide the button
      setIsVisible(false);
    }
  }, [toast]);

  const handleDismiss = () => {
    // Hide the custom install button
    setIsVisible(false);
    // Optionally, you could store a flag in localStorage to not show the prompt again
    localStorage.setItem('hidePWAInstallPrompt', 'true');
  };

  // Don't show the prompt if:
  // - It's already been dismissed
  // - On iOS (which handles PWA installation differently)
  // - The app is already installed
  // - Running in Mobsted PWA
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isMobsted = window.navigator.userAgent.includes('Mobsted');
  
  if (isIOS || isStandalone || !isVisible || isMobsted) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-w-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">Install Ladderhive</h3>
        <button 
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Dismiss"
        >
          <X size={20} />
        </button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Install this application on your home screen for quick and easy access when you're on the go.
      </p>
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDismiss}
        >
          Not Now
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleInstallClick}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="mr-2 h-4 w-4" />
          Install
        </Button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
