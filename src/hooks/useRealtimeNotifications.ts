import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export interface Notification {
  id: number;
  type: string;
  content_summary: string;
  actor_user_id: string | null;
  created_at: string;
  is_read: boolean;
  references: any;
}

/**
 * Realtime listener for the `notifications` table.
 * Returns the newest 50 notifications for the logged-in user and
 * prepends new ones via Supabase Realtime.
 */
export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    let ignore = false;

    const fetchExisting = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && !ignore) {
        setNotifications(data || []);
      }
    };

    fetchExisting();

    // Subscribe to new notifications for this user
    const channel = supabase
      .channel(`notifications:user:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { notifications };
};
