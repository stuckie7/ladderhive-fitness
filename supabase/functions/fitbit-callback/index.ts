/**
 * @no-auth
 * This function can be called without authentication
 */

// @ts-ignore - Allow unauthenticated access
// @no-auth
// @no-cookie

// Simple CORS headers with explicit permissions
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
};

// Main request handler
export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  
  // Log basic request info
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // Handle test endpoint
  if (url.pathname.endsWith('/test')) {
    return new Response(JSON.stringify({ 
      status: 'ok', 
      message: 'Test endpoint is working',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: corsHeaders
    });
  }
  
  // Handle other endpoints
  return new Response(JSON.stringify({ 
    status: 'error', 
    message: 'Not found',
    path: url.pathname
  }), {
    status: 404,
    headers: corsHeaders
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // Parse URL
    const url = new URL(req.url);
    console.log('Parsed URL:', {
      pathname: url.pathname,
      searchParams: Object.fromEntries(url.searchParams.entries())
    });

    // Handle test endpoint
    if (url.pathname.endsWith('/test')) {
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          message: 'Test endpoint is working',
          timestamp: new Date().toISOString()
        }),
        { headers: corsHeaders }
      );
    }

    // Handle OAuth callback
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (!code || !state) {
      return new Response(
        JSON.stringify({ error: 'Missing code or state parameter' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // If we get here, the basic flow is working
    return new Response(
      JSON.stringify({ 
        status: 'success',
        message: 'OAuth callback received',
        code,
        state
      }),
      { headers: corsHeaders }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: errorMessage 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};
