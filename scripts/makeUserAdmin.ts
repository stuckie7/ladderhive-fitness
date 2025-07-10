import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://jrwyptpespjvjisrwnbh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd3lwdHBlc3Bqdmppc3J3bmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTQ4MTYsImV4cCI6MjA1OTAzMDgxNn0.Ab2IxEvQekhOKlyjYbBQQjukIsOdghmRkQcmQtZNUWk';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function makeUserAdmin(userId: string) {
  try {
    // First, get the service role key from the Supabase dashboard
    // Note: In a real application, never hardcode the service role key in client-side code
    // This is for demonstration purposes only
    const serviceRoleKey = 'YOUR_SERVICE_ROLE_KEY'; // Replace with your service role key from Supabase
    
    // Create an admin client with the service role key
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Update the user's metadata to include admin role
    const { data, error } = await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: { role: 'admin' }
    });

    if (error) {
      throw error;
    }

    console.log('User updated successfully:', data.user);
    console.log('User is now an admin');
    return data.user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// For security reasons, we'll use the Supabase dashboard to run this
console.log('To make a user an admin:');
console.log('1. Go to the Supabase dashboard at https://app.supabase.com');
console.log('2. Navigate to Authentication > Users');
console.log('3. Find the user with ID: 7f295fcf-fa53-4eae-b157-08e09834f039');
console.log('4. Click the edit (pencil) icon');
console.log('5. In the "User Metadata" section, add or update the role field:');
console.log('   {');
console.log('     "role": "admin"');
console.log('   }');
console.log('6. Save the changes');
console.log('7. The user will need to log out and log back in for changes to take effect');
