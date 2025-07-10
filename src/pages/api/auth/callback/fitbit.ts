import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return renderError(res, `Fitbit authorization failed: ${oauthError}`);
    }

    if (!code || !state) {
      return renderError(res, 'Missing required parameters');
    }

    // Verify the state parameter
    const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    const { data: storedState, error: stateError } = await supabase
      .from('fitbit_auth_states')
      .select('*')
      .eq('user_id', stateData.userId)
      .single();

    if (stateError || !storedState || storedState.state !== state) {
      return renderError(res, 'Invalid state parameter');
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        code: code as string,
        grant_type: 'authorization_code',
        client_id: process.env.FITBIT_CLIENT_ID || '',
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fittrackpro.lovable.app'}/api/auth/callback/fitbit`,
        code_verifier: 'challenge' // Should match the code_challenge from the authorization request
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Error exchanging code for token:', tokenData);
      return renderError(res, 'Failed to exchange authorization code for access token');
    }

    // Store the tokens in the database
    const { error: tokenError } = await supabase
      .from('fitbit_tokens')
      .upsert({
        user_id: stateData.userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        scope: tokenData.scope,
        token_type: tokenData.token_type,
        user_id_fitbit: tokenData.user_id
      }, {
        onConflict: 'user_id'
      });

    if (tokenError) {
      console.error('Error storing tokens:', tokenError);
      return renderError(res, 'Failed to store authentication tokens');
    }

    // Clean up the state
    await supabase
      .from('fitbit_auth_states')
      .delete()
      .eq('user_id', stateData.userId);

    // Return a success page that will close the popup and notify the parent
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fitbit Connected</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f8fafc;
              color: #1e293b;
            }
            .container {
              text-align: center;
              padding: 2rem;
              max-width: 400px;
            }
            .success-icon {
              color: #10b981;
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 {
              margin: 0 0 1rem 0;
              font-size: 1.5rem;
              font-weight: 600;
            }
            p {
              margin: 0 0 2rem 0;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✓</div>
            <h1>Successfully Connected to Fitbit!</h1>
            <p>You can now close this window and return to the app.</p>
          </div>
          <script>
            // Notify the parent window that authentication was successful
            try {
              // Try to notify the opener first (for popup flow)
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ 
                  type: 'FITBIT_AUTH_SUCCESS',
                  timestamp: Date.now()
                }, window.location.origin);
                
                // Close the popup after a short delay
                setTimeout(() => {
                  window.close();
                }, 1000);
              } 
              // If we're in a tab (like in Mobstead), try to redirect back to the app
              else if (window.self === window.top) {
                // Try to get the return URL from localStorage or default to the root
                const returnUrl = localStorage.getItem('fitbit_return_url') || '/';
                localStorage.removeItem('fitbit_return_url');
                
                // Add a small delay to ensure the message is processed
                setTimeout(() => {
                  window.location.href = returnUrl;
                }, 1000);
              }
              // Fallback: just close the window if we can't do anything else
              else {
                window.close();
              }
            } catch (error) {
              console.error('Error in callback:', error);
              // Last resort: redirect to home
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in Fitbit callback:', error);
    return renderError(res, 'An unexpected error occurred');
  }
}

function renderError(res: NextApiResponse, message: string) {
  return res.status(400).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Error Connecting to Fitbit</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f8fafc;
            color: #1e293b;
          }
          .container {
            text-align: center;
            padding: 2rem;
            max-width: 400px;
          }
          .error-icon {
            color: #ef4444;
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          h1 {
            margin: 0 0 1rem 0;
            font-size: 1.5rem;
            font-weight: 600;
          }
          p {
            margin: 0 0 2rem 0;
            color: #64748b;
          }
          button {
            background-color: #3b82f6;
            color: white;
            border: none;
            border-radius: 0.375rem;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          button:hover {
            background-color: #2563eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">✕</div>
          <h1>Error Connecting to Fitbit</h1>
          <p>${message}</p>
          <button onclick="window.close()">Close Window</button>
        </div>
        <script>
          // Notify the parent window about the error
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'FITBIT_AUTH_ERROR',
              error: '${message.replace(/'/g, "\\'")}'
            }, window.location.origin);
          }
        </script>
      </body>
    </html>
  `);
}
