import { supabase } from '@/lib/supabase';

/**
 * Invoke a Supabase Edge Function while automatically attaching the current
 * user's access token. Throws if the user is not authenticated so the caller
 * can handle the error.
 */
export async function invokeWithAuth<T = any>(
  functionName: string,
  options: Omit<Parameters<typeof supabase.functions.invoke>[1], 'headers'> = {}
) {
  // Obtain the current session/token
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw sessionError ?? new Error('No active session found');
  }

  return supabase.functions.invoke<T>(functionName, {
    ...(options as any), // cast to any to allow headers override
    headers: {
      ...((options as any).headers || {}),
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });
}
