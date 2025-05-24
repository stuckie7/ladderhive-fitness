
import SignupForm from "@/components/auth/SignupForm";

const Signup = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md mb-8">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <img src="/fitapp%20icon%2048x48.jpg" alt="FitTrack Pro Logo" className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome to FitTrack Pro</h1>
          <p className="text-muted-foreground mt-2">Create your account to get started</p>
        </div>
        
        <SignupForm />
      </div>
    </div>
  );
};

export default Signup;
