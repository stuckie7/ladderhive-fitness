
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, Dumbbell, Users, BarChart3, Calendar, Target, Award, HeartPulse, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user && window.location.pathname === "/") {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-green-500/20 bg-black">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img 
              src="/fittrackpro-logo.jpg" 
              alt="FitTrack Pro Logo" 
              className="h-10 w-10 rounded-lg shadow-lg shadow-green-500/20"
            />
            <div className="text-2xl font-bold text-green-400">FitTrack Pro</div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-green-500/10"
              onClick={() => navigate("/login")}
            >
              Log in
            </Button>
            <Button 
              className="bg-green-500 hover:bg-green-600 text-black font-semibold shadow-lg shadow-green-500/25"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
                  Your <span className="text-green-400">Personalized</span> Fitness Journey
                </h1>
                <p className="max-w-[600px] text-gray-300 md:text-xl">
                  Transform your body and mind with Admin-Designed smart workouts, expert guidance, and real-time progress tracking.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button 
                  size="lg" 
                  className="bg-green-500 hover:bg-green-600 text-black h-12 px-8 text-lg font-semibold shadow-lg shadow-green-500/25"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-12 px-8 text-lg border-green-500 text-green-400 hover:bg-green-500/10"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[400px] w-full max-w-[500px] overflow-hidden rounded-xl border border-green-500/30 bg-gray-900 shadow-lg shadow-green-500/10">
                <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-green-400/10" />
                <div className="relative flex h-full items-center justify-center p-8">
                  <Dumbbell className="h-32 w-32 text-green-500/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-white">
              Why Choose <span className="text-green-400">FitTrack Pro</span>?
            </h2>
            <p className="mt-4 text-gray-300">
              Everything you need to achieve your fitness goals in one powerful platform.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-green-500/20 bg-black/80 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/40">
              <CardHeader className="pb-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20 shadow-lg">
                  <Dumbbell className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="mt-4 text-white">Smart Workouts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Admin-Designed smart workout plans that adapt to your progress, goals, and available equipment.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-green-500/20 bg-black/80 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/40">
              <CardHeader className="pb-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20 shadow-lg">
                  <Target className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="mt-4 text-white">Goal Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Set, track, and achieve your fitness goals with our intuitive progress dashboard.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-green-500/20 bg-black/80 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/40">
              <CardHeader className="pb-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20 shadow-lg">
                  <HeartPulse className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="mt-4 text-white">Health Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Get detailed analytics and insights about your health and fitness journey.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-black">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-white">
              Trusted by Fitness Enthusiasts
            </h2>
            <p className="mt-4 text-gray-300">
              Join thousands of users who transformed their fitness journey with FitTrack Pro.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-green-500/20 bg-gray-900/80 backdrop-blur-sm hover:border-green-500/40 transition-all">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-green-400 text-green-400" />
                    ))}
                  </div>
                  <p className="text-gray-300">
                    "FitTrack Pro completely transformed my fitness routine. The personalized workouts and progress tracking keep me motivated every day."
                  </p>
                  <div className="flex items-center gap-3 pt-4">
                    <Avatar>
                      <AvatarImage src="/avatars/01.png" alt="Sarah K." />
                      <AvatarFallback className="bg-green-500/20 text-green-400">SK</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">Sarah K.</p>
                      <p className="text-sm text-gray-400">Lost 15 lbs in 2 months</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-500/20 bg-gray-900/80 backdrop-blur-sm hover:border-green-500/40 transition-all">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-green-400 text-green-400" />
                    ))}
                  </div>
                  <p className="text-gray-300">
                    "As a busy professional, I need efficient workouts. FitTrack Pro gives me exactly what I need in the time I have."
                  </p>
                  <div className="flex items-center gap-3 pt-4">
                    <Avatar>
                      <AvatarImage src="/avatars/02.png" alt="Michael T." />
                      <AvatarFallback className="bg-green-500/20 text-green-400">MT</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">Michael T.</p>
                      <p className="text-sm text-gray-400">Gained 10 lbs of muscle</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-500/20 bg-gray-900/80 backdrop-blur-sm hover:border-green-500/40 transition-all">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-green-400 text-green-400" />
                    ))}
                  </div>
                  <p className="text-gray-300">
                    "The community and support in FitTrack Pro is unmatched. I've never been able to stick with a program this long before!"
                  </p>
                  <div className="flex items-center gap-3 pt-4">
                    <Avatar>
                      <AvatarImage src="/avatars/03.png" alt="Jessica L." />
                      <AvatarFallback className="bg-green-500/20 text-green-400">JL</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">Jessica L.</p>
                      <p className="text-sm text-gray-400">Consistently active for 6+ months</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-500/10 to-green-600/5">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6 text-white">
            Ready to transform your fitness journey?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Join FitTrack Pro today and take the first step towards a healthier, stronger you.
          </p>
          <Button 
            size="lg" 
            className="bg-green-500 hover:bg-green-600 text-black h-14 px-12 text-lg font-semibold shadow-lg shadow-green-500/25"
            onClick={() => navigate("/signup")}
          >
            Get Started for Free
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-black border-t border-green-500/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="/fittrackpro-logo.jpg" 
                alt="FitTrack Pro Logo" 
                className="h-8 w-8 rounded-md shadow-md shadow-green-500/20"
              />
              <span className="font-bold text-green-400">FitTrack Pro</span>
            </div>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a 
                href="/terms-of-service" 
                className="text-sm text-gray-400 hover:text-green-400 transition-colors"
              >
                Terms of Service
              </a>
              <a 
                href="/privacy-policy" 
                className="text-sm text-gray-400 hover:text-green-400 transition-colors"
              >
                Privacy Policy
              </a>
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} FitTrack Pro. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
