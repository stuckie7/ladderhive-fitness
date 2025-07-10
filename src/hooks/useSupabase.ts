
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}

export function useUser() {
  const { session, loading } = useSession()
  return { user: session?.user, loading }
}

export function useSignIn() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { signIn, loading, error }
}

export function useSignUp() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const signUp = async (email: string, password: string, userMetadata = {}) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
        },
      })
      if (error) throw error
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { signUp, loading, error }
}

export function useSignOut() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const signOut = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { signOut, loading, error }
}

// Example of a custom hook for forum posts
export function useForumPosts(threadId: string) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('forum_posts')
          .select('*')
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true })

        if (error) throw error
        setPosts(data || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()

    // Set up realtime subscription
    const subscription = supabase
      .channel('forum_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_posts',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts((prev) => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setPosts((prev) =>
              prev.map((post) =>
                post.id === payload.new.id ? payload.new : post
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setPosts((prev) => prev.filter((post) => post.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [threadId])

  return { posts, loading, error }
}
