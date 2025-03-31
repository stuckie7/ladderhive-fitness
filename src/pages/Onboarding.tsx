
import OnboardingForm from "@/components/auth/OnboardingForm";

const Onboarding = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md mb-8">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-fitness-primary rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">LH</span>
          </div>
          <h1 className="text-3xl font-bold">Welcome to LadderHive</h1>
          <p className="text-muted-foreground mt-2">Let's set up your fitness profile</p>
        </div>
        
        <OnboardingForm />
      </div>
    </div>
  );
};

export default Onboarding;
