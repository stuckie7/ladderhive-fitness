# Fitbit Integration Guide

This document outlines the steps to set up and use the Fitbit integration in the application.

## Prerequisites

1. A Fitbit developer account (https://dev.fitbit.com/)
2. A registered Fitbit application with the following settings:
   - Application Type: Personal
   - Callback URL: `https://your-domain.com/api/auth/callback/fitbit`
   - OAuth 2.0: Enabled
   - Required permissions: activity, heartrate, location, nutrition, profile, settings, sleep, social, weight

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Fitbit Configuration
VITE_FITBIT_CLIENT_ID=your_client_id
VITE_FITBIT_CLIENT_SECRET=your_client_secret
VITE_SITE_URL=http://localhost:3000  # Update with your production URL

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database Setup

Create the following tables in your Supabase database:

```sql
-- Table to store Fitbit tokens
create table if not exists public.fitbit_tokens (
  user_id uuid references auth.users(id) primary key,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  scope text,
  token_type text,
  user_id_fitbit text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table to store OAuth states for security
create table if not exists public.fitbit_auth_states (
  user_id uuid references auth.users(id) primary key,
  state text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS) for security
alter table public.fitbit_tokens enable row level security;
alter table public.fitbit_auth_states enable row level security;

-- Create policies for secure access
create policy "Users can view their own Fitbit tokens"
on public.fitbit_tokens for select
using (auth.uid() = user_id);

create policy "Users can insert their own Fitbit tokens"
on public.fitbit_tokens for insert
with check (auth.uid() = user_id);

create policy "Users can update their own Fitbit tokens"
on public.fitbit_tokens for update
using (auth.uid() = user_id);

create policy "Users can delete their own Fitbit tokens"
on public.fitbit_tokens for delete
using (auth.uid() = user_id);
```

## Usage

1. **Adding the Login Button**

   Import and use the `FitbitLoginButton` component in your application:

   ```tsx
   import { FitbitLoginButton } from '@/components/auth/FitbitLoginButton';

   function MyComponent() {
     const handleSuccess = () => {
       console.log('Successfully connected to Fitbit!');
       // Refresh data or update UI
     };

     const handleError = (error: Error) => {
       console.error('Fitbit connection error:', error);
       // Show error message to user
     };

     return (
       <div>
         <FitbitLoginButton 
           onSuccess={handleSuccess}
           onError={handleError}
         />
       </div>
     );
   }
   ```

2. **Checking Connection Status**

   Use the `useFitbit` hook to check the connection status:

   ```tsx
   import { useFitbit } from '@/hooks/useFitbit';

   function MyComponent() {
     const { isConnected, isLoading, error, healthData, refreshData } = useFitbit();

     if (isLoading) {
       return <div>Loading Fitbit data...</div>;
     }

     if (error) {
       return <div>Error: {error.message}</div>;
     }

     return (
       <div>
         {isConnected ? (
           <div>
             <h2>Connected to Fitbit</h2>
             <pre>{JSON.stringify(healthData, null, 2)}</pre>
             <button onClick={refreshData}>Refresh Data</button>
           </div>
         ) : (
           <FitbitLoginButton 
             onSuccess={refreshData}
             onError={handleError}
           />
         )}
       </div>
     );
   }
   ```

## Troubleshooting

### Common Issues

1. **OAuth Redirect URI Mismatch**
   - Ensure the `VITE_SITE_URL` matches exactly with the URL registered in your Fitbit application settings.
   - The callback URL should be `{VITE_SITE_URL}/api/auth/callback/fitbit`.

2. **CORS Issues**
   - Make sure your API routes are properly configured to handle CORS requests.
   - Check the browser console for any CORS-related errors.

3. **Token Storage**
   - Verify that the `fitbit_tokens` table is being updated correctly.
   - Check for any errors in the server logs when storing or retrieving tokens.

4. **Scope Permissions**
   - If certain data is not accessible, ensure you've requested the necessary scopes in the OAuth flow.
   - The user may need to re-authenticate if you add new scopes.

## Security Considerations

- Never expose your `VITE_FITBIT_CLIENT_SECRET` in client-side code.
- Use environment variables for all sensitive configuration.
- Implement proper error handling and logging.
- Regularly rotate your Fitbit client secret.
- Implement rate limiting on your API endpoints.

## Deployment

When deploying to production:

1. Update the `VITE_SITE_URL` to your production domain.
2. Ensure all environment variables are properly set in your hosting platform.
3. Set up HTTPS to ensure secure communication.
4. Monitor the application logs for any issues with the Fitbit integration.

## Testing

1. Test the OAuth flow in development using the local development server.
2. Verify that tokens are being stored and retrieved correctly.
3. Test the refresh token flow to ensure long-term access.
4. Verify error handling for various scenarios (network issues, revoked access, etc.).

## Support

For issues with the Fitbit integration, please refer to:

- [Fitbit Web API Documentation](https://dev.fitbit.com/build/reference/web-api/)
- [Fitbit OAuth 2.0 Documentation](https://dev.fitbit.com/build/reference/web-api/authorization/)
- [Supabase Documentation](https://supabase.com/docs)

## License

This integration is provided under the MIT License.
