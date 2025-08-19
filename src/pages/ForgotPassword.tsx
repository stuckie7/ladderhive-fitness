import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.hostname === 'localhost' ? 'https://www.fittrackprov1.com' : window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage('Check your email for the password reset link');
      toast({
        title: 'Success',
        description: 'Password reset link sent to your email',
      });
    } catch (error: any) {
      setMessage(error.error_description || error.message);
      toast({
        title: 'Error',
        description: error.error_description || error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="mx-auto h-24 w-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl p-2 border border-border/20">
            <img 
              src="/fittrackpro-logo.jpg" 
              alt="FitTrack Pro Logo" 
              className="h-full w-full rounded-xl object-cover" 
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Forgot Password</h1>
          <p className="text-muted-foreground">Enter your email to reset your password</p>
        </div>
        
        <div className="bg-card p-8 rounded-lg shadow-sm border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="you@example.com"
              />
            </div>

            {message && (
              <div className="p-3 text-sm rounded-md bg-blue-50 text-blue-800">
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
