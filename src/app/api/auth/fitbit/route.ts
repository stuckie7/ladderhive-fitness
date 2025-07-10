import { NextResponse } from 'next/server';

export async function GET() {
  const fitbitAuthUrl = new URL('https://www.fitbit.com/oauth2/authorize');
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.FITBIT_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/fitbit`,
    scope: 'activity heartrate profile',
    state: Math.random().toString(36).substring(7),
  });

  fitbitAuthUrl.search = params.toString();
  
  return NextResponse.redirect(fitbitAuthUrl.toString());
}
