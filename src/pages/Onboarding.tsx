
import OnboardingForm from "@/components/auth/OnboardingForm";

const Onboarding = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md mb-8 px-4 sm:px-0">
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 bg-white rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-xl p-2 border border-border/20">
            <img 
              src="/fittrackpro-logo.jpg" 
              alt="FitTrack Pro Logo" 
              className="h-full w-full rounded-xl object-cover"
              loading="eager"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Welcome to FitTrack Pro</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Let's set up your fitness profile</p>
        </div>
        
        <OnboardingForm />
      </div>
    </div>
  );
};

export default Onboarding;
