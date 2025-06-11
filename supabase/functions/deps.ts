// Environment variables type
export interface EnvVars {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  FITBIT_CLIENT_ID: string;
  FITBIT_CLIENT_SECRET: string;
  SITE_URL: string;
}

// Supabase client types
export interface SupabaseClient {
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string } | null };
      error: Error | null;
    }>;
  };
}

// Deno runtime mock
export const deno = {
  serve: (handler: (req: Request) => Response | Promise<Response>) => ({
    serve: (h: any) => h
  })
};

// Supabase client implementation
export const createClient = (
  url: string, 
  key: string, 
  options?: { global: { headers: Record<string, string> } }
): SupabaseClient => ({
  auth: {
    getUser: async () => ({
      data: { user: { id: 'mock-user-id' } },
      error: null
    })
  }
});

// CORS headers
export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Environment variables helper
export function getEnvVars(): EnvVars {
  const env = {
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    FITBIT_CLIENT_ID: '',
    FITBIT_CLIENT_SECRET: '',
    SITE_URL: 'http://localhost:3000',
  };

  // Safely access Deno.env if available
  if (typeof Deno !== 'undefined' && Deno.env) {
    return {
      SUPABASE_URL: Deno.env.get('SUPABASE_URL') || env.SUPABASE_URL,
      SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY') || env.SUPABASE_ANON_KEY,
      FITBIT_CLIENT_ID: Deno.env.get('FITBIT_CLIENT_ID') || env.FITBIT_CLIENT_ID,
      FITBIT_CLIENT_SECRET: Deno.env.get('FITBIT_CLIENT_SECRET') || env.FITBIT_CLIENT_SECRET,
      SITE_URL: Deno.env.get('SITE_URL') || env.SITE_URL,
    };
  }

  return env;
}

// Export a default object with all exports for easier importing
export default {
  deno,
  createClient,
  corsHeaders,
  getEnvVars,
};

// Export Web API types for use in other files
export { Request, Response, Headers };
