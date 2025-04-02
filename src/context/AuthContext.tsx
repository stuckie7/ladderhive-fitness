
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        // If user just signed in, redirect to dashboard
        if (event === 'SIGNED_IN') {
          setTimeout(() => {
            navigate('/dashboard');
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setTimeout(() => {
            navigate('/login');
          }, 0);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Got existing session:", currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      // Use toast outside of component render
      setTimeout(() => {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }, 0);
    } catch (error: any) {
      console.error("Login error:", error);
      setTimeout(() => {
        toast({
          title: "Login failed",
          description: error.message || "Check your credentials and try again.",
          variant: "destructive",
        });
      }, 0);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: name.split(' ')[0],
            last_name: name.split(' ').slice(1).join(' ')
          }
        }
      });

      if (error) throw error;
      
      setTimeout(() => {
        toast({
          title: "Account created",
          description: "Please check your email to confirm your registration.",
        });
      }, 0);
    } catch (error: any) {
      setTimeout(() => {
        toast({
          title: "Registration failed",
          description: error.message || "An error occurred during signup.",
          variant: "destructive",
        });
      }, 0);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setTimeout(() => {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
      }, 0);
    } catch (error: any) {
      console.error("Error logging out:", error);
      setTimeout(() => {
        toast({
          title: "Error",
          description: "An error occurred while logging out.",
          variant: "destructive",
        });
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
