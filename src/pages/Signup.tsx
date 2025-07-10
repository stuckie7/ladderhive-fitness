
import SignupForm from "@/components/auth/SignupForm";

const Signup = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md mb-8">
        <div className="text-center mb-10">
          <div className="mx-auto h-24 w-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl p-2 border border-border/20">
            <img 
              src="/fittrackpro-logo.jpg" 
              alt="FitTrack Pro Logo" 
              className="h-full w-full rounded-xl object-cover" 
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to FitTrack Pro</h1>
          <p className="text-muted-foreground">Create your account to get started</p>
        </div>
        
        <SignupForm />
      </div>
    </div>
  );
};

export default Signup;
