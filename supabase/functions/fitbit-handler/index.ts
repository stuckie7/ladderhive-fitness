import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("fitbit-handler: Loading with core logic test (Fitbit call and DB upsert commented out)...");

// Environment variables
const FITBIT_CLIENT_ID = Deno.env.get('FITBIT_CLIENT_ID');
const FITBIT_CLIENT_SECRET = Deno.env.get('FITBIT_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000'; // Default for safety
const HANDLER_REDIRECT_URI = `https://jrwyptpespjvjisrwnbh.supabase.co/functions/v1/fitbit-handler`;

console.log("fitbit-handler: Environment variables loaded:", {
  FITBIT_CLIENT_ID_SET: !!FITBIT_CLIENT_ID,
  FITBIT_CLIENT_SECRET_SET: !!FITBIT_CLIENT_SECRET,
  SUPABASE_URL_SET: !!SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY_SET: !!SUPABASE_SERVICE_ROLE_KEY,
  siteUrl_VALUE: siteUrl,
  HANDLER_REDIRECT_URI_VALUE: HANDLER_REDIRECT_URI
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

// Helper to exchange auth code for tokens (actual call will be commented out for now)
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
    redirect_uri: HANDLER_REDIRECT_URI, // Must match what was sent in the auth request and Fitbit app config
    client_id: FITBIT_CLIENT_ID,
    code_verifier: codeVerifier, // PKCE parameter
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

  const responseBodyText = await response.text(); // Read body once to log and then parse
  console.log('Fitbit token exchange response status:', response.status);
  console.log('Fitbit token exchange response body:', responseBodyText);

  if (!response.ok) {
    // Log more details if possible from Fitbit's error
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

serve(async (req: Request) => {
  const url = new URL(req.url);
  console.log(`[${new Date().toISOString()}] fitbit-handler: Request: ${req.method} ${url.pathname}${url.search}`);

  if (req.method === 'OPTIONS') {
    console.log('fitbit-handler: Handling OPTIONS preflight request');
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    console.log('fitbit-handler: Method not allowed:', req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let parsedCode: string | null = null;
  let parsedStateString: string | null = null;
  let parsedErrorParam: string | null = null;
  let decodedStateData: any = null;
  let extractedUserId: string | null = null;
  let extractedOrigin: string = siteUrl; // Default origin
  let extractedCodeVerifier: string | null = null;
  let processingErrorMsg: string | null = null;
  
  // Declare responsePayload here, to be initialized after basic parsing or in catch block
  let responsePayload: Record<string, any>;

  try {
    parsedCode = url.searchParams.get('code');
    parsedStateString = url.searchParams.get('state');
    parsedErrorParam = url.searchParams.get('error');

    console.log(`fitbit-handler: Received params - code: ${!!parsedCode}, state: ${!!parsedStateString}, error: ${parsedErrorParam}`);

    if (parsedErrorParam) {
      processingErrorMsg = `OAuth error from Fitbit: ${parsedErrorParam} - ${url.searchParams.get('error_description') || 'No description'}`;
      throw new Error(processingErrorMsg); // Throw to go to catch block for consistent error handling
    }

    if (!parsedCode || !parsedStateString) {
      const missing = [!parsedCode && 'code', !parsedStateString && 'state'].filter(Boolean).join(', ');
      processingErrorMsg = `Missing required parameters: ${missing}`;
      throw new Error(processingErrorMsg);
    }

    try {
      decodedStateData = JSON.parse(decodeURIComponent(parsedStateString));
      extractedUserId = decodedStateData.userId;
      extractedOrigin = decodedStateData.origin || siteUrl;
      extractedCodeVerifier = decodedStateData.codeVerifier;
      if (!extractedUserId || !extractedCodeVerifier) {
        processingErrorMsg = 'Incomplete state data: userId or codeVerifier missing.';
        throw new Error(processingErrorMsg);
      }
      console.log(`fitbit-handler: Extracted from state - userId: ${extractedUserId}, origin: ${extractedOrigin}, codeVerifier: ${extractedCodeVerifier ? 'present' : 'absent'}`);
    } catch (e) {
      const stateParseErrorMessage = e instanceof Error ? e.message : 'Unknown error parsing state.';
      console.error('fitbit-handler: Error parsing state:', stateParseErrorMessage, 'Raw state:', parsedStateString);
      processingErrorMsg = `Invalid state parameter: ${stateParseErrorMessage}.`;
      throw new Error(processingErrorMsg); // Re-throw to be caught by the main catch
    }

    // Initialize responsePayload now that basic parameters are parsed and validated
    responsePayload = {
      message: "fitbit-handler: Fitbit API call test",
      timestamp: new Date().toISOString(),
      params: {
          codeReceived: !!parsedCode,
          stateReceived: !!parsedStateString,
          errorReceived: parsedErrorParam, // Will be null if we passed initial checks
      },
      decodedState: {
          userId: extractedUserId,
          origin: extractedOrigin,
          codeVerifierIsPresent: !!extractedCodeVerifier,
          codeVerifierPreview: extractedCodeVerifier ? extractedCodeVerifier.substring(0, 20) + "..." : null,
          rawStateString: parsedStateString,
      },
      processingOutcome: {
          error: null, // Initially null, will be set by catch if an error occurs later
      },
      envVarsCheck: { 
        FITBIT_CLIENT_ID_IS_SET: !!FITBIT_CLIENT_ID,
        FITBIT_CLIENT_SECRET_IS_SET: !!FITBIT_CLIENT_SECRET,
        SUPABASE_URL_IS_SET: !!SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY_IS_SET: !!SUPABASE_SERVICE_ROLE_KEY,
        SUPABASE_CLIENT_INITIALIZED: !!supabaseAdminClient
      },
      fitbitTokenResponse: null 
    };

    console.log('fitbit-handler: Attempting to exchange code for token with Fitbit API...');
    const tokenData = await exchangeCodeForToken(parsedCode, extractedCodeVerifier);
    console.log('fitbit-handler: Token exchange with Fitbit API successful for user:', extractedUserId);
    console.log('Fitbit token data received:', tokenData);
    responsePayload.fitbitTokenResponse = tokenData; // Assign successful token data

    // --- DB Upsert and Redirect --- 
    if (!supabaseAdminClient) { 
      processingErrorMsg = "Supabase admin client not initialized. Cannot save tokens.";
      throw new Error(processingErrorMsg); 
    }
    console.log('fitbit-handler: Attempting to save tokens to Supabase for user:', extractedUserId);
    const { error: dbError } = await supabaseAdminClient.from('fitbit_tokens').upsert({
      user_id: extractedUserId, // This is the Supabase auth user ID
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
      scope: tokenData.scope,
      fitbit_user_id: tokenData.user_id, // This is the Fitbit user ID
    }, { onConflict: 'user_id' });

    if (dbError) {
      processingErrorMsg = `Failed to save Fitbit tokens to database: ${dbError.message}`;
      console.error('fitbit-handler: Database error:', processingErrorMsg, dbError);
      throw new Error(processingErrorMsg);
    }
    console.log('fitbit-handler: Tokens saved successfully to Supabase for user:', extractedUserId);
    
    const redirectUrl = `${extractedOrigin}/profile?status=success&provider=fitbit`;
    console.log('fitbit-handler: Redirecting to:', redirectUrl);
    return Response.redirect(redirectUrl, 302);
    // --- End of DB Upsert and Redirect ---

  } catch (error) {
    // processingErrorMsg should have been set by the specific error throw points above
    // or if not, set it from the generic error object here.
    if (!processingErrorMsg) {
        processingErrorMsg = error instanceof Error ? error.message : 'Unknown error during Fitbit callback processing.';
    }
    console.error('fitbit-handler: Catch-all error in processing:', processingErrorMsg, error instanceof Error ? error.stack : '');
    
    // Ensure extractedOrigin is set if possible, for error redirect (though not used in this JSON response step)
    if (decodedStateData && decodedStateData.origin) {
        extractedOrigin = decodedStateData.origin;
    } else if (parsedStateString) {
        try { 
            const tempState = JSON.parse(decodeURIComponent(parsedStateString)); 
            extractedOrigin = tempState.origin || extractedOrigin;
        } catch (e) { /* use existing extractedOrigin */ }
    }

    // Initialize or update responsePayload with error information
    // If responsePayload wasn't initialized in try (e.g. error in initial param check), create it here.
    if (!responsePayload) { 
        responsePayload = { 
            message: "fitbit-handler: Error occurred before full processing",
            timestamp: new Date().toISOString(),
            params: { codeReceived: !!parsedCode, stateReceived: !!parsedStateString, errorReceived: parsedErrorParam },
            decodedState: { 
                userId: extractedUserId, 
                origin: extractedOrigin, 
                codeVerifierIsPresent: !!extractedCodeVerifier, 
                rawStateString: parsedStateString 
            },
            processingOutcome: { error: processingErrorMsg }, 
            envVarsCheck: { 
                FITBIT_CLIENT_ID_IS_SET: !!FITBIT_CLIENT_ID,
                SUPABASE_CLIENT_INITIALIZED: !!supabaseAdminClient
            },
            fitbitTokenResponse: null 
        };
    } else {
        // If responsePayload *was* initialized in try, but an error occurred later (e.g., DB upsert),
        // ensure the error is set. fitbitTokenResponse might contain data if token exchange succeeded before DB error.
        responsePayload.processingOutcome.error = processingErrorMsg;
    }
    // At this point, responsePayload exists and processingOutcome.error is set.
    return new Response(JSON.stringify(responsePayload), {
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  // If no error was caught, the function should have already returned a Response.redirect.
  // This part should ideally not be reached if everything in try was successful and redirected.
  // However, as a fallback, if it's reached without an error and without a redirect, return an error JSON.
  console.error("fitbit-handler: Reached end of function without redirect or explicit error response. This indicates a logic flow issue.");
  return new Response(JSON.stringify({
    message: "fitbit-handler: Unexpected end of function flow.",
    timestamp: new Date().toISOString(),
    processingOutcome: { error: "Internal server error: Unexpected function termination."}
  }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
