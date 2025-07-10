import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for access token in URL
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const type = searchParams.get('type');

  useEffect(() => {
    // If this is a password recovery flow, update the session
    if (type === 'recovery' && accessToken) {
      const updateSession = async () => {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) throw error;
          
          // Clear the URL parameters
          window.history.replaceState({}, document.title, '/reset-password');
        } catch (error: any) {
          setError(error.error_description || error.message);
        }
      };
      
      updateSession();
    }
  }, [accessToken, refreshToken, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) throw error;
      
      setMessage('Password updated successfully!');
      toast({
        title: 'Success',
        description: 'Your password has been updated successfully',
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setError(error.error_description || error.message);
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>
        
        <div className="bg-card p-8 rounded-lg shadow-sm border border-border">
          {error && (
            <div className="mb-6 p-3 text-sm rounded-md bg-red-50 text-red-800">
              {error}
            </div>
          )}
          
          {message ? (
            <div className="text-center">
              <div className="mb-4 p-3 inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-800">{message}</p>
              <p className="mt-2 text-sm text-muted-foreground">Redirecting to login page...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Updating...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
