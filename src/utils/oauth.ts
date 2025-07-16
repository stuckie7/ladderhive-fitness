/**
 * Utility functions for handling OAuth flows in different environments
 */

interface OAuthWindow extends Window {
  oauthCallback?: (url: string) => void;
}

declare const window: OAuthWindow;

/**
 * Prevents OAuth from being loaded in an iframe
 * Should be called at the top of any OAuth-related components
 */
export function preventOAuthInIframe() {
  if (window.self !== window.top) {
    // If we're in an iframe, redirect to a new tab with the same URL
    const url = new URL(window.location.href);
    // Remove any existing _oob parameter to prevent loops
    url.searchParams.delete('_oob');
    window.open(url.toString(), '_blank');
    // Return false to indicate we're in an iframe and handled the redirect
    return false;
  }
  return true;
}

/**
 * Handles the OAuth flow by opening in a popup
 * @param authUrl The OAuth URL to redirect to
 * @param onSuccess Callback when OAuth flow completes successfully
 * @param onError Callback when OAuth flow fails
 */
export function startOAuthFlow(
  authUrl: string,
  onSuccess: (data: any) => void,
  onError: (error: Error) => void
) {
  // Generate a unique ID for this OAuth attempt
  const state = Math.random().toString(36).substring(2, 15);
  
  // Store the state and callbacks
  const oauthState = {
    state,
    timestamp: Date.now(),
    onSuccess,
    onError
  };
  
  // Store in session storage (cleared when tab closes)
  sessionStorage.setItem('oauth_state', JSON.stringify(oauthState));
  
  // Open a popup window
  const width = 600;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  
  // Ensure the auth URL has the correct parameters for popup flow
  const url = new URL(authUrl);
  url.searchParams.set('display', 'popup');
  
  // Add a unique ID to the state to prevent CSRF
  const stateObj = {
    ...(url.searchParams.get('state') ? { state: url.searchParams.get('state') } : {}),
    _popup: '1',
    _ts: Date.now()
  };
  url.searchParams.set('state', JSON.stringify(stateObj));
  
  // Open the popup with the modified URL
  const popup = window.open(
    '',
    'oauth_popup',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
  );
  
  if (!popup) {
    onError(new Error('Popup blocked. Please allow popups for this site and try again.'));
    return null;
  }
  
  // Navigate to the auth URL in the popup
  popup.location.href = url.toString();
  
  // Focus the popup (might help with some browsers)
  popup.focus();
  
  // Set up message listener for the popup
  const messageHandler = (event: MessageEvent) => {
    // Only handle messages from our own origin
    if (event.origin !== window.location.origin) return;
    
    const { type, data, error } = event.data || {};
    
    if (type === 'oauth_callback') {
      // Clean up
      window.removeEventListener('message', messageHandler);
      
      if (error) {
        onError(new Error(error));
      } else {
        onSuccess(data);
      }
      
      // Close the popup if it's still open
      if (popup && !popup.closed) {
        popup.close();
      }
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  // Set up interval to check if popup was closed by the user
  const popupCheck = setInterval(() => {
    if (popup.closed) {
      clearInterval(popupCheck);
      window.removeEventListener('message', messageHandler);
      
      // If we get here and haven't received a success/error, the user probably closed the popup
      const state = sessionStorage.getItem('oauth_state');
      if (state) {
        const { onError } = JSON.parse(state);
        if (onError) {
          onError(new Error('Authentication was cancelled'));
        }
      }
    }
  }, 500);
  
  return popup;
}

/**
 * Handles the OAuth callback from the popup
 * Should be called from the OAuth callback page
 */
export function handleOAuthCallback() {
  try {
    // Get the state from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    // If this is an error, send it back to the opener
    if (error) {
      if (window.opener) {
        window.opener.postMessage({
          type: 'oauth_callback',
          error: error || 'Authentication failed'
        }, window.location.origin);
      }
      return;
    }
    
    // If we have a code, send it back to the opener
    if (code && state) {
      if (window.opener) {
        window.opener.postMessage({
          type: 'oauth_callback',
          data: { code, state }
        }, window.location.origin);
      }
    }
    
    // Close the popup
    window.close();
  } catch (err) {
    console.error('Error handling OAuth callback:', err);
    if (window.opener) {
      window.opener.postMessage({
        type: 'oauth_callback',
        error: 'An unexpected error occurred'
      }, window.location.origin);
    }
    window.close();
  }
}

// Extend the existing Window interface to include our custom properties
declare global {
  interface Window {
    addEventListener(
      type: 'message',
      listener: (event: MessageEvent) => void,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(
      type: 'message',
      listener: (event: MessageEvent) => void,
      options?: boolean | EventListenerOptions
    ): void;
    opener: any; // Using 'any' to avoid conflicts with existing type definitions
    close(): void;
  }
}
