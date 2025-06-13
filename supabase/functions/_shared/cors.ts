// CORS headers for Supabase Functions
type HeadersInit = Headers | string[][] | Record<string, string>;

interface ResponseInit {
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Helper to add CORS headers to a response
export const withCors = (response: Response): Response => {
  const headers = new Headers(response.headers as HeadersInit);
  
  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return new Response(response.body as BodyInit | null, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

// Helper to create a CORS response
export const createCorsResponse = (
  body: any = null,
  status: number = 200,
  headers: Record<string, string> = {}
): Response => {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    ...corsHeaders,
    ...headers
  } as HeadersInit);

  const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
  
  return new Response(bodyString, {
    status,
    headers: responseHeaders
  });
};
