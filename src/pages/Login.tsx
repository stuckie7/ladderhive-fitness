
import LoginForm from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md mb-8">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-fitness-primary rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">LH</span>
          </div>
          <h1 className="text-3xl font-bold">LadderHive Fitness</h1>
          <p className="text-muted-foreground mt-2">Your journey to better fitness starts here</p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
