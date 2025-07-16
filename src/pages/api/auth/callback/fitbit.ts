import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fitbit API credentials
const fitbitClientId = process.env.FITBIT_CLIENT_ID || '';
const fitbitClientSecret = process.env.FITBIT_CLIENT_SECRET || '';

// Types
interface FitbitTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id: string;
  scope: string;
  token_type: string;
}

interface ErrorResponse {
  error: string;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean } | ErrorResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are allowed'
    });
  }

  const { code, state, error: oauthError } = req.query;

  // Check for OAuth errors
  if (oauthError) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fitbit Connection Failed</title>
          <script>
            window.onload = function() {
              window.opener.postMessage({
                type: 'oauth_callback',
                error: 'OAuth Error',
                message: 'Failed to authorize with Fitbit: ${oauthError}'
              }, window.location.origin);
              
              // Close the popup after a short delay
              setTimeout(() => window.close(), 1000);
            };
          </script>
        </head>
        <body>
          <p>Failed to connect to Fitbit. You can close this window.</p>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(400).send(errorHtml);
  }

  // Verify we have the required parameters
  if (!code || !state) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <script>
            window.onload = function() {
              window.opener.postMessage({
                type: 'oauth_callback',
                error: 'Missing Parameters',
                message: 'Missing required OAuth parameters: code and state are required'
              }, window.location.origin);
              
              // Close the popup after a short delay
              setTimeout(() => window.close(), 1000);
            };
          </script>
        </head>
        <body>
          <p>Missing required parameters. Please try again.</p>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(400).send(errorHtml);
  }

  try {
    // Decode and validate the state parameter
    let userId: string;
    try {
      const stateObj = JSON.parse(decodeURIComponent(state as string));
      userId = stateObj.userId || stateObj.state?.userId;
      
      if (!userId) {
        throw new Error('User ID not found in state');
      }
    } catch (stateError) {
      const errorHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error</title>
            <script>
              window.onload = function() {
                window.opener.postMessage({
                  type: 'oauth_callback',
                  error: 'Invalid State',
                  message: 'The state parameter is invalid or corrupted. Please try again.'
                }, window.location.origin);
                
                // Close the popup after a short delay
                setTimeout(() => window.close(), 1000);
              };
            </script>
          </head>
          <body>
            <p>Invalid state parameter. Please try again.</p>
          </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      return res.status(400).send(errorHtml);
    }

    // Exchange the authorization code for an access token
    const tokenUrl = 'https://api.fitbit.com/oauth2/token';
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback/fitbit`;
    const basicAuth = Buffer.from(`${fitbitClientId}:${fitbitClientSecret}`).toString('base64');
    
    const tokenParams = new URLSearchParams();
    tokenParams.append('clientId', fitbitClientId);
    tokenParams.append('code', code as string);
    tokenParams.append('grant_type', 'authorization_code');
    tokenParams.append('redirect_uri', redirectUri);

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams.toString()
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('Fitbit token exchange error:', errorData);
      
      const errorMessage = errorData?.errors?.[0]?.message || 'Failed to exchange authorization code for access token';
      const errorHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error</title>
            <script>
              window.onload = function() {
                window.opener.postMessage({
                  type: 'oauth_callback',
                  error: 'Token Exchange Failed',
                  message: '${errorMessage.replace(/'/g, "\\'")}'
                }, window.location.origin);
                
                // Close the popup after a short delay
                setTimeout(() => window.close(), 1000);
              };
            </script>
          </head>
          <body>
            <p>Failed to exchange authorization code. Please try again.</p>
          </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      return res.status(400).send(errorHtml);
    }

    const tokenData = await tokenResponse.json() as FitbitTokenResponse;

    // Store the tokens in the database
    const { error: dbError } = await supabase
      .from('fitbit_tokens')
      .upsert({
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
        scope: tokenData.scope,
        fitbit_user_id: tokenData.user_id,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to store Fitbit tokens');
    }

    // Update user's connection status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        fitbit_connected: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't fail the whole flow if profile update fails
    }

    // Return success response for the popup
    const successHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fitbit Connection Successful</title>
          <script>
            // Notify the parent window and close the popup
            window.onload = function() {
              window.opener.postMessage({
                type: 'oauth_callback',
                data: {
                  success: true,
                  fitbit_user_id: '${tokenData.user_id}'
                }
              }, window.location.origin);
              
              // Close the popup after a short delay
              setTimeout(() => window.close(), 500);
            };
          </script>
        </head>
        <body>
          <p>Successfully connected to Fitbit! You can close this window.</p>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(successHtml);

  } catch (error) {
    console.error('Fitbit callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <script>
            window.onload = function() {
              window.opener.postMessage({
                type: 'oauth_callback',
                error: 'Internal Server Error',
                message: '${errorMessage.replace(/'/g, "\\'")}'
              }, window.location.origin);
              
              // Close the popup after a short delay
              setTimeout(() => window.close(), 1000);
            };
          </script>
        </head>
        <body>
          <p>An unexpected error occurred. Please try again.</p>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(500).send(errorHtml);
  }
}
