// Central export point for all type definitions

// Web APIs
export * from './web-apis';

// Deno runtime
export * from './deno';

// Re-export DOM types that are needed
declare global {
  // Web API types
  interface Request extends globalThis.Request {}
  interface Response extends globalThis.Response {}
  interface Headers extends globalThis.Headers {}
  
  // Add any global type augmentations here
  interface Window {
    // Add any window properties if needed
  }
  
  // Declare the global Deno namespace if it doesn't exist
  namespace NodeJS {
    interface ProcessEnv {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      FITBIT_CLIENT_ID: string;
      FITBIT_CLIENT_SECRET: string;
      SITE_URL: string;
    }
  }
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

// Environment variables
export interface EnvVars {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  FITBIT_CLIENT_ID: string;
  FITBIT_CLIENT_SECRET: string;
  SITE_URL: string;
}

// Export the Request and Response types for use in other files
export type { Request, Response, Headers };

// Export the Deno namespace for type checking
export interface DenoGlobal {
  env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  };
}

declare const Deno: DenoGlobal;
