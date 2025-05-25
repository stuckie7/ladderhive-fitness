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
      <header className="border-b border-border/40">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img 
              src="/fittrackpro-logo.jpg" 
              alt="FitTrack Pro Logo" 
              className="h-8 w-8 rounded-md"
            />
            <span className="font-bold text-lg">FitTrack Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost"
              onClick={() => navigate("/login")}
            >
              Log in
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-black"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Your <span className="text-green-500">Personalized</span> Fitness Journey
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Transform your body and mind with AI-powered workouts, expert guidance, and real-time progress tracking.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button 
                  size="lg" 
                  className="bg-fitness-primary hover:bg-fitness-primary/90 h-12 px-8 text-lg"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-12 px-8 text-lg"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[400px] w-full max-w-[500px] overflow-hidden rounded-xl border bg-card shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-tr from-fitness-primary/20 to-fitness-secondary/20" />
                <div className="relative flex h-full items-center justify-center p-8">
                  <Dumbbell className="h-32 w-32 text-fitness-primary/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Why Choose LadderHive?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to achieve your fitness goals in one powerful platform.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg">
              <CardHeader className="pb-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-600/20">
                  <Dumbbell className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="mt-4">Smart Workouts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI-powered workout plans that adapt to your progress, goals, and available equipment.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg">
              <CardHeader className="pb-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-600/20">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="mt-4">Goal Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Set, track, and achieve your fitness goals with our intuitive progress dashboard.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg">
              <CardHeader className="pb-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-600/20">
                  <HeartPulse className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="mt-4">Health Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get detailed analytics and insights about your health and fitness journey.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Trusted by Fitness Enthusiasts
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of users who transformed their fitness journey with LadderHive.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "LadderHive completely transformed my fitness routine. The personalized workouts and progress tracking keep me motivated every day."
                  </p>
                  <div className="flex items-center gap-3 pt-4">
                    <Avatar>
                      <AvatarImage src="/avatars/01.png" alt="Sarah K." />
                      <AvatarFallback>SK</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Sarah K.</p>
                      <p className="text-sm text-muted-foreground">Lost 15 lbs in 2 months</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "As a busy professional, I need efficient workouts. LadderHive gives me exactly what I need in the time I have."
                  </p>
                  <div className="flex items-center gap-3 pt-4">
                    <Avatar>
                      <AvatarImage src="/avatars/02.png" alt="Michael T." />
                      <AvatarFallback>MT</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Michael T.</p>
                      <p className="text-sm text-muted-foreground">Gained 10 lbs of muscle</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "The community and support in LadderHive is unmatched. I've never been able to stick with a program this long before!"
                  </p>
                  <div className="flex items-center gap-3 pt-4">
                    <Avatar>
                      <AvatarImage src="/avatars/03.png" alt="Jessica L." />
                      <AvatarFallback>JL</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Jessica L.</p>
                      <p className="text-sm text-muted-foreground">Consistently active for 6+ months</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600/10 to-green-800/10">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6">
            Ready to transform your fitness journey?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join FitTrack Pro today and take the first step towards a healthier, stronger you.
          </p>
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700 h-14 px-12 text-lg text-black"
            onClick={() => navigate("/signup")}
          >
            Get Started for Free
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border/40">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <img 
                src="/fittrackpro-logo.jpg" 
                alt="FitTrack Pro Logo" 
                className="h-8 w-8 rounded-md"
              />
              <span className="font-bold">FitTrack Pro</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4 md:mt-0">
              © {new Date().getFullYear()} FitTrack Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
