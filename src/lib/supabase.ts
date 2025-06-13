import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jrwyptpespjvjisrwnbh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd3lwdHBlc3Bqdmppc3J3bmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTQ4MTYsImV4cCI6MjA1OTAzMDgxNn0.Ab2IxEvQekhOKlyjYbBQQjukIsOdghmRkQcmQtZNUWk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
