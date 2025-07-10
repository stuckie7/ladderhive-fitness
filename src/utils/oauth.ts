/**
 * Utility functions for handling OAuth flows in different environments
 */

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
 * Handles the OAuth flow by opening in a new tab
 * @param authUrl The OAuth URL to redirect to
 */
export function startOAuthFlow(authUrl: string) {
  // Store the current URL to return to after auth
  const returnUrl = window.location.pathname + window.location.search;
  localStorage.setItem('fitbit_return_url', returnUrl);
  
  // Open in a new tab
  const newWindow = window.open(authUrl, '_blank');
  
  // Focus the new window if possible
  if (newWindow) {
    newWindow.focus();
  }
  
  return newWindow;
}
