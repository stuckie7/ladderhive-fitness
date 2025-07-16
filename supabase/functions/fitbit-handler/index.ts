// Disable default JWT verification for this public callback endpoint
export const verifyJwt = false;

// Import required modules with explicit types
// @ts-ignore - Ignore type checking for external modules
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import Deno standard library
// @ts-ignore - Ignore type checking for Deno standard library
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Environment variables
const FITBIT_CLIENT_ID = Deno.env.get('FITBIT_CLIENT_ID');
const FITBIT_CLIENT_SECRET = Deno.env.get('FITBIT_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SITE_URL = Deno.env.get('SITE_URL') || 'https://www.fittrackprov1.com';
const HANDLER_REDIRECT_URI = `https://jrwyptpespjvjisrwnbh.supabase.co/functions/v1/fitbit-handler`;

console.log("fitbit-handler: Environment variables loaded:", {
  FITBIT_CLIENT_ID_SET: !!FITBIT_CLIENT_ID,
  FITBIT_CLIENT_SECRET_SET: !!FITBIT_CLIENT_SECRET,
  SUPABASE_URL_SET: !!SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY_SET: !!SUPABASE_SERVICE_ROLE_KEY,
  SITE_URL,
  HANDLER_REDIRECT_URI
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Supabase Admin Client Initialization
let supabaseAdminClient: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  console.log("fitbit-handler: Supabase admin client initialized.");
} else {
  console.error("fitbit-handler: Supabase URL or Service Role Key missing. Client not initialized.");
}

// Helper to create basic auth header
function createBasicAuthHeader(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  const base64 = btoa(unescape(encodeURIComponent(credentials)));
  return `Basic ${base64}`;
}

declare function btoa(input: string): string; // Deno provides this globally

// Helper to exchange auth code for tokens
async function exchangeCodeForToken(code: string, codeVerifier: string) {
  if (!FITBIT_CLIENT_ID || !FITBIT_CLIENT_SECRET) {
    throw new Error("Fitbit Client ID or Secret not configured.");
  }
  console.log('exchangeCodeForToken: Attempting to exchange code for token with Fitbit...');
  console.log({ codeReceivedLength: code?.length, codeVerifierReceivedLength: codeVerifier?.length });

  const tokenUrl = 'https://api.fitbit.com/oauth2/token';
  const authHeader = createBasicAuthHeader(FITBIT_CLIENT_ID, FITBIT_CLIENT_SECRET);
  
  const tokenRequestBody = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: HANDLER_REDIRECT_URI,
    client_id: FITBIT_CLIENT_ID,
    code_verifier: codeVerifier,
  });
  
  console.log('Token request body being sent to Fitbit:', tokenRequestBody.toString());

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': authHeader
    },
    body: tokenRequestBody.toString(),
  });

  const responseBodyText = await response.text();
  console.log('Fitbit token exchange response status:', response.status);
  console.log('Fitbit token exchange response body:', responseBodyText);

  if (!response.ok) {
    let fitbitError = responseBodyText;
    try {
      const parsedError = JSON.parse(responseBodyText);
      if (parsedError.errors && parsedError.errors.length > 0) {
        fitbitError = parsedError.errors.map((e: any) => `${e.errorType}: ${e.message}`).join(', ');
      }
    } catch (e) { /* Ignore if not JSON */ }
    throw new Error(`Token exchange with Fitbit failed: ${response.status} ${response.statusText} - Details: ${fitbitError}`);
  }
  
  return JSON.parse(responseBodyText);
}

// Helper function to create error responses
function createErrorResponse(error: string, origin: string): Response {
  console.error('Creating error response:', error);
  
  // Create an HTML response with postMessage for errors
  const errorHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Fitbit Authorization Error</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f8f9fa;
          color: #212529;
        }
        .container {
          text-align: center;
          padding: 2rem;
          max-width: 500px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #dc3545; margin-top: 0; }
        .message { margin: 1.5rem 0; }
        .subtext { color: #6c757d; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Authorization Error</h1>
        <div class="message">
          <p>There was an error authorizing with Fitbit:</p>
          <p><strong>${escapeHtml(error)}</strong></p>
        </div>
        <p class="subtext">You can close this window and try again.</p>
      </div>
      <script>
        // Notify parent window of the error
        const message = {
          type: 'fitbit-auth-error',
          error: '${escapeHtml(error).replace(/'/g, "\\'")}',
          provider: 'fitbit'
        };
        
        // Try to send message to parent/opener window
        try {
          if (window.opener) {
            window.opener.postMessage(message, '${origin || "*"}');
          } else if (window.parent !== window) {
            window.parent.postMessage(message, '${origin || "*"});
          }
          
          // Auto-close after a short delay if we're in a popup
          if (window.opener) {
            setTimeout(() => window.close(), 2000);
          }
        } catch (e) {
          console.error('Error sending error message:', e);
        }
      </script>
    </body>
  </html>
  `;
  
  return new Response(errorHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      ...corsHeaders
    }
  });
}

// Helper to escape HTML for safe insertion into HTML
function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

serve(async (req: Request) => {
  const requestId = Math.random().toString(36).substring(2, 9);
  console.log(`[${requestId}] === New Fitbit OAuth Callback ===`);
  console.log(`[${requestId}] Request URL:`, req.url);
  console.log(`[${requestId}] Request method:`, req.method);
  console.log(`[${requestId}] Headers:`, Object.fromEntries(req.headers.entries()));
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  // Set CORS headers for all responses
  const setCorsHeaders = (headers: Record<string, string> = {}) => {
    const allHeaders = {
      ...corsHeaders,
      ...headers
    };
    console.log('Setting response headers:', allHeaders);
    return allHeaders;
  };

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] Handling OPTIONS preflight request`);
    return new Response('ok', { headers: setCorsHeaders() });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: setCorsHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  // Parse URL and query parameters
  const url = new URL(req.url);
  console.log(`[${new Date().toISOString()}] fitbit-handler: Request: ${req.method} ${url.pathname}${url.search}`);

  // Extract query parameters
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  console.log(`[${requestId}] OAuth Callback Parameters:`, {
    hasCode: !!code,
    hasState: !!stateParam,
    error: error || 'none'
  });
  
  // Log the incoming request for debugging
  console.log('Received OAuth callback:', { 
    hasCode: !!code, 
    hasState: !!stateParam,
    state: stateParam ? (stateParam.length > 100 ? stateParam.substring(0, 100) + '...' : stateParam) : 'none',
    timestamp: new Date().toISOString()
  });
  
  // Handle error from Fitbit
  if (error) {
    const errorDescription = url.searchParams.get('error_description') || 'Unknown error';
    const errorMsg = `Fitbit OAuth error [${requestId}]: ${error} - ${errorDescription}`;
    console.error(errorMsg);
    console.log(`[${requestId}] Sending error response to client`);
    return createErrorResponse(`Fitbit authorization failed: ${error} - ${errorDescription}`, SITE_URL);
  }
  
  // Check for required parameters
  if (!code || !stateParam) {
    const errorMsg = `[${requestId}] Missing required parameters: ${!code ? 'code ' : ''}${!stateParam ? 'state' : ''}`;
    console.error(errorMsg);
    console.log(`[${requestId}] Sending error response to client`);
    return createErrorResponse('Missing required parameters for OAuth callback', SITE_URL);
  }

  // Define state data interface
  interface StateData {
    userId: string;
    nonce: string;
    origin?: string;
  }
  
  // Variables that need to be in the outer scope
  let userId: string;
  let nonce: string;
  let origin: string;
  let stateData: StateData;
  
  try {
    // Create Supabase client
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      { 
        auth: { persistSession: false },
        global: { headers: { 'X-Request-ID': requestId } }
      }
    );

    console.log(`[${requestId}] Supabase client initialized`);
    
    try {
      console.log(`[${requestId}] Parsing state parameter`);
      const decodedState = decodeURIComponent(stateParam || '');
      console.log(`[${requestId}] Decoded state:`, decodedState);
      const parsedState = JSON.parse(decodedState) as Partial<StateData>;
      
      // Verify required fields in state
      if (!parsedState.userId || !parsedState.nonce) {
        const errorMsg = `[${requestId}] Invalid state format - missing required fields: ${JSON.stringify(parsedState)}`;
        console.error(errorMsg);
        return createErrorResponse('Invalid state parameter format', SITE_URL);
      }
      
      stateData = {
        userId: parsedState.userId,
        nonce: parsedState.nonce,
        origin: parsedState.origin
      };
      
      // Assign values from state data
      userId = stateData.userId;
      nonce = stateData.nonce;
      origin = stateData.origin || SITE_URL;
      
      if (!userId || !nonce) {
        throw new Error('Invalid state: missing userId or nonce');
      }
      console.log('Parsed state:', { userId, nonce, origin });
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to parse state parameter');
      console.error('Error parsing state:', error);
      return createErrorResponse('Invalid state parameter', SITE_URL);
    }

    // Get code verifier from database
    if (!supabaseAdminClient) {
      throw new Error('Supabase admin client not initialized');
    }

    console.log(`[${requestId}] Fetching PKCE verifier for nonce:`, nonce);
    
    // First, check if the table exists and is accessible
    const { data: tableInfo, error: tableError } = await supabaseAdminClient
      .rpc('get_table_info', { table_name: 'fitbit_pkce' })
      .single();
      
    if (tableError) {
      console.error(`[${requestId}] Error checking fitbit_pkce table:`, tableError);
    } else {
      console.log(`[${requestId}] Table info:`, tableInfo);
    }
    
    // Get all PKCE entries for debugging
    const { data: allPkce, error: allPkceError } = await supabaseAdminClient
      .from('fitbit_pkce')
      .select('*')
      .limit(10);
      
    if (allPkceError) {
      console.error(`[${requestId}] Error fetching all PKCE entries:`, allPkceError);
    } else {
      console.log(`[${requestId}] Current PKCE entries:`, allPkce);
    }
    
    // Now try to get the specific verifier
    const { data: pkceRow, error: pkceError } = await supabaseAdminClient
      .from('fitbit_pkce')
      .select('code_verifier, created_at, user_id')
      .eq('pkce_key', nonce)
      .single();

    if (pkceError) {
      console.error(`[${requestId}] PKCE verifier lookup error:`, pkceError);
      
      // Try one more time after a short delay in case of replication lag
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: retryPkceRow, error: retryError } = await supabaseAdminClient
        .from('fitbit_pkce')
        .select('code_verifier, created_at, user_id')
        .eq('pkce_key', nonce)
        .single();
        
      if (retryError || !retryPkceRow?.code_verifier) {
        console.error(`[${requestId}] PKCE verifier not found after retry:`, retryError?.message || 'No code_verifier found');
        
        // Create a redirect response with proper headers
        const redirectUrl = new URL(origin || SITE_URL);
        redirectUrl.searchParams.set('error', 'PKCE verification failed. Please try again.');
        
        // Set default headers
        const headers = new Headers({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        });
        
        // If this is a popup, return HTML that will close the window
        if (req.headers.get('sec-fetch-dest') === 'document') {
          return createErrorResponse('PKCE verification failed. Please try again.', origin);
        }
        
        // Otherwise, redirect with error
        headers.set('Location', redirectUrl.toString());
        return new Response(null, { status: 302, headers });
      }
      
      // If we got here, the retry worked
      console.log(`[${requestId}] PKCE verifier found on retry`);
      // Continue with the retry data
      return await exchangeCodeForToken(code, retryPkceRow.code_verifier);
    }
    
    if (!pkceRow?.code_verifier) {
      console.error(`[${requestId}] No code_verifier found for nonce:`, nonce);
      return createErrorResponse('PKCE verification failed. Please try again.', origin);
    }
    
    // If we got here, we have the code verifier - proceed with token exchange
    console.log(`[${requestId}] Found PKCE verifier, proceeding with token exchange`);
    
    try {
      // Exchange the code for tokens
      console.log(`[${requestId}] Exchanging code for tokens, code length:`, code?.length || 0);
      console.log(`[${requestId}] Code verifier length:`, pkceRow.code_verifier?.length || 0);
      
      const tokenData = await exchangeCodeForToken(code, pkceRow.code_verifier);
      console.log(`[${requestId}] Successfully obtained tokens from Fitbit`);
      
      // Store tokens in database
      if (!supabaseAdminClient) {
        throw new Error('Supabase admin client not initialized');
      }
      
      const { error: upsertError } = await supabaseAdminClient
        .from('fitbit_tokens')
        .upsert({
          user_id: userId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          scope: tokenData.scope,
          token_type: tokenData.token_type,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error(`[${requestId}] Error storing tokens:`, upsertError);
        throw new Error('Failed to store Fitbit tokens');
      }
      
      // Clean up the PKCE entry after successful token exchange
      try {
        await supabaseAdminClient
          .from('fitbit_pkce')
          .delete()
          .eq('pkce_key', nonce);
        console.log(`[${requestId}] Cleaned up PKCE record`);
      } catch (cleanupError) {
        console.error(`[${requestId}] Error cleaning up PKCE record:`, cleanupError);
        // Continue even if cleanup fails
      }
      
      // Create success response
      const successUrl = new URL(origin || SITE_URL);
      successUrl.searchParams.set('fitbit_connected', 'true');
      
      // Enhanced success HTML with better styling and fallback behavior
      const successHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fitbit Authorization Successful</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f8f9fa;
              color: #212529;
            }
            .container {
              text-align: center;
              padding: 2rem;
              max-width: 500px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { 
              color: #28a745; 
              margin-top: 0; 
            }
            .spinner {
              border: 4px solid rgba(0, 0, 0, 0.1);
              width: 36px;
              height: 36px;
              border-radius: 50%;
              border-left-color: #28a745;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .success-message {
              margin: 20px 0;
              color: #28a745;
              font-weight: 500;
            }
            .redirect-message {
              color: #6c757d;
              font-size: 0.9em;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Success!</h1>
            <div class="spinner"></div>
            <p class="success-message">Fitbit account connected successfully</p>
            <p class="redirect-message">You will be redirected shortly...</p>
          </div>
          <script>
            // Prepare the success message
            const message = {
              type: 'fitbit-auth-success',
              success: true,
              provider: 'fitbit',
              timestamp: new Date().toISOString()
            };

            // Try to notify the parent window
            function notifyParent() {
              try {
                if (window.opener) {
                  // For popup windows
                  window.opener.postMessage(message, '${origin || '*'}');
                  console.log('Message sent to opener:', message);
                  setTimeout(() => window.close(), 1000);
                  return true;
                } else if (window.parent !== window) {
                  // For iframes
                  window.parent.postMessage(message, '${origin || '*'}');
                  return true;
                }
                return false;
              } catch (e) {
                console.error('Error sending message:', e);
                return false;
              }
            }

            // Execute notification when page loads
            document.addEventListener('DOMContentLoaded', () => {
              const notified = notifyParent();
              
              // If we couldn't notify the opener, redirect to the main site
              if (!notified) {
                setTimeout(() => {
                  window.location.href = '${successUrl.toString()}';
                }, 2000);
              }
            });
          </script>
        </body>
      </html>`;
      
      // Return the HTML response
      return new Response(successHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          ...setCorsHeaders()
        }
      });
      
    } catch (error) {
      console.error(`[${requestId}] Error in OAuth callback:`, error);
      
      // Create error redirect URL
      const errorUrl = new URL(origin || SITE_URL);
      errorUrl.searchParams.set('fitbit_error', 'Failed to complete authorization');
      
      // If this is a popup, return HTML that will close the window with error
      if (req.headers.get('sec-fetch-dest') === 'document') {
        const errorHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Fitbit Authorization Failed</title>
            <script>
              window.opener.postMessage({
                type: 'fitbit-auth-error',
                error: 'Failed to complete authorization',
                provider: 'fitbit'
              }, '${origin || '*'}');
              window.close();
            </script>
          </head>
          <body>
            <p>Authorization failed. Please try again.</p>
          </body>
        </html>`;
        
        return new Response(errorHtml, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
            ...setCorsHeaders()
          }
        });
      }
      
      // Otherwise, redirect with error
      return new Response(null, {
        status: 302,
        headers: {
          'Location': errorUrl.toString(),
          ...setCorsHeaders()
        }
      });
    }
    
    // Create success response HTML
    const successHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Fitbit Authorization Successful</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f8f9fa;
            color: #212529;
          }
          .container {
            text-align: center;
            padding: 2rem;
            max-width: 500px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { color: #28a745; margin-top: 0; }
          .message { margin: 1.5rem 0; }
          .subtext { color: #6c757d; font-size: 0.9em; }
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border-left-color: #28a745;
            animation: spin 1s linear infinite;
            margin: 0 auto 1.5rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Authorization Successful</h1>
          <div class="spinner"></div>
          <div class="message">
            <p>You have successfully connected your Fitbit account.</p>
          </div>
          <p class="subtext">You can close this window.</p>
        </div>
        <script>
          // Get URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const stateParam = urlParams.get('state');
          const code = urlParams.get('code');
          
          // Parse the state parameter
          let state = {};
          try {
            state = stateParam ? JSON.parse(decodeURIComponent(stateParam)) : {};
          } catch (e) {
            console.error('Error parsing state:', e);
          }
          
          // Prepare the success message
          const message = {
            type: 'fitbit-auth-success',
            code: code,
            state: state,
            provider: 'fitbit'
          };
                  // Function to notify parent/opener window
          function notifyParent() {
            try {
              if (window.opener) {
                // For popup windows
                window.opener.postMessage(message, state.origin || '*');
                console.log('Message sent to opener:', message);
                // Auto-close after a short delay
                setTimeout(() => {
                  try {
                    window.close();
                  } catch (e) {
                    console.log('Could not close window automatically');
                    // Fallback to redirect if window can't be closed
                    const redirectUrl = new URL('${SITE_URL}');
                    redirectUrl.searchParams.set('fitbit_auth', 'success');
                    window.location.href = redirectUrl.toString();
                  }
                }, 1000);
                return true;
              } else if (window.parent !== window) {
                // For iframes
                window.parent.postMessage(message, state.origin || '*');
                return true;
              }
              return false;
            } catch (e) {
              console.error('Error sending message:', e);
              return false;
            }
          }

          // Execute notification when page loads
          document.addEventListener('DOMContentLoaded', () => {
            const notified = notifyParent();
            if (!notified) {
              // If we couldn't notify the opener, redirect to the main site
              const redirectUrl = new URL('${SITE_URL}');
              redirectUrl.searchParams.set('fitbit_auth', 'success');
              window.location.href = redirectUrl.toString();
            }
          });
        </script>
      </body>
    </html>
    `;
    
    // Return the HTML response
    return new Response(successHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Error in OAuth callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    // Try to get the origin from the state if available
    let origin = SITE_URL;
    try {
      if (stateParam) {
        const stateData = JSON.parse(decodeURIComponent(stateParam));
        if (stateData.origin) {
          origin = stateData.origin;
        }
      }
    } catch (e) {
      console.error('Error parsing state in error handler:', e);
      // Use default SITE_URL if we can't parse the state
    }
    
    return createErrorResponse(errorMessage, origin);
  }
});
