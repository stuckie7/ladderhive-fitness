import { createClient } from '@supabase/supabase-js'

// Access environment variables using import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Basic check to ensure variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  // You might want to throw an error here or handle it more gracefully
  // For now, this will cause the "supabaseUrl is required" error if they are missing
}

export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
