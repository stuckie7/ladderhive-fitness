
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, Dumbbell, Users, BarChart3, Calendar } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("user");
    if (user) {
      // Redirect to dashboard if logged in
      navigate("/dashboard");
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-fitness-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold">LH</span>
              </div>
              <span className="font-bold text-lg">LadderHive</span>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost"
                onClick={() => navigate("/login")}
              >
                Log in
              </Button>
              <Button 
                className="bg-fitness-primary hover:bg-fitness-primary/90"
                onClick={() => navigate("/signup")}
              >
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your <span className="text-fitness-primary">Personalized</span> Fitness Journey
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Achieve your fitness goals with customized workouts, expert coaching, and progress tracking all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-fitness-primary hover:bg-fitness-primary/90 text-lg h-12 px-8"
                onClick={() => navigate("/signup")}
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg h-12 px-8"
                onClick={() => navigate("/login")}
              >
                Log In
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose LadderHive?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
              <div className="bg-fitness-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Dumbbell className="h-6 w-6 text-fitness-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Workouts</h3>
              <p className="text-muted-foreground">
                Custom workout plans tailored to your fitness level, goals, and available equipment.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
              <div className="bg-fitness-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-fitness-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Coaching</h3>
              <p className="text-muted-foreground">
                Access to professional trainers and form feedback to maximize your results.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
              <div className="bg-fitness-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-fitness-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Track your improvements with detailed metrics and visualizations of your journey.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
              <div className="bg-fitness-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-fitness-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
              <p className="text-muted-foreground">
                Plan your workouts with an intelligent calendar that adapts to your availability.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Success Stories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <p className="mb-4 text-muted-foreground">
                "LadderHive transformed my fitness routine. The personalized workouts and progress tracking keep me motivated every day."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div>
                  <p className="font-medium">Sarah K.</p>
                  <p className="text-sm text-muted-foreground">Lost 15 lbs in 2 months</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <p className="mb-4 text-muted-foreground">
                "As a busy professional, I need efficient workouts. LadderHive gives me exactly what I need in the time I have available."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div>
                  <p className="font-medium">Mark T.</p>
                  <p className="text-sm text-muted-foreground">Gained 8 lbs of muscle</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <p className="mb-4 text-muted-foreground">
                "The coaching features in LadderHive helped me correct my form and prevent injuries while pushing my limits."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div>
                  <p className="font-medium">Jessica M.</p>
                  <p className="text-sm text-muted-foreground">Improved marathon time by 12%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-fitness-primary to-fitness-secondary text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Fitness Journey?
          </h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
            Join thousands of users who have achieved their fitness goals with LadderHive.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-fitness-primary hover:bg-gray-100 text-lg h-12 px-8"
            onClick={() => navigate("/signup")}
          >
            Start Free Trial
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-fitness-primary rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">LH</span>
                </div>
                <span className="font-bold text-lg">LadderHive</span>
              </div>
              <p className="text-gray-400 max-w-sm">
                Personalized fitness coaching and workout tracking for everyone.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-medium mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Press</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Guides</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Privacy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Terms</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Cookies</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} LadderHive Fitness. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
