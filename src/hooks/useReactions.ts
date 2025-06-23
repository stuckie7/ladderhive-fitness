import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface ReactionCounts {
  [emoji: string]: number;
}

/**
 * React hook to provide reaction counts for a given forum post and allow the
 * logged-in user to toggle their own 👍 reaction. Easily extendable for more
 * emojis by parameterising the `emoji` variable.
 */
export function useReactions(postId: number, emoji: string = '👍') {
  const { user } = useAuth();
  const [counts, setCounts] = useState<ReactionCounts>({});
  const [hasReacted, setHasReacted] = useState(false);

  // Fetch counts + user status
  const refresh = async () => {
    // Counts grouped by emoji
    const { data: countData } = await supabase
      .from('post_reactions')
      .select('emoji, count:emoji', { count: 'exact', head: false })
      .eq('post_id', postId)
      .group('emoji');

    const map: ReactionCounts = {};
    countData?.forEach((r: any) => {
      map[r.emoji] = (r as any).count;
    });
    setCounts(map);

    if (user) {
      const { count } = await supabase
        .from('post_reactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);
      setHasReacted((count ?? 0) > 0);
    }
  };

  useEffect(() => {
    refresh();

    // Realtime subscription
    const channel = supabase
      .channel(`reactions-${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_reactions', filter: `post_id=eq.${postId}` },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, user?.id]);

  const toggleReaction = async () => {
    if (!user) return;

    if (hasReacted) {
      await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);
    } else {
      await supabase.from('post_reactions').insert({
        post_id: postId,
        user_id: user.id,
        emoji,
      });
    }
  };

  return { counts, hasReacted, toggleReaction };
}
