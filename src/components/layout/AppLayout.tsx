
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  Dumbbell, 
  BarChart3, 
  User, 
  Settings, 
  Calendar,
  LogOut,
  Menu,
  Flame
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AppLayoutProps {
  children: React.ReactNode;
}

interface UserProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  name?: string;
  [key: string]: any;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  
  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setUserData({
            ...data,
            email: user.email,
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || user.email
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setUserData({
          id: user.id,
          first_name: null,
          last_name: null,
          email: user.email,
          name: user.email
        });
      }
    };
    
    fetchUserProfile();
  }, [navigate, user]);
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };
  
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home, color: "text-fitness-primary" },
    { path: "/workouts", label: "Workouts", icon: Dumbbell, color: "text-fitness-secondary" },
    { path: "/progress", label: "Progress", icon: BarChart3, color: "text-fitness-accent" },
    { path: "/schedule", label: "Schedule", icon: Calendar, color: "text-fitness-orange" },
    { path: "/profile", label: "Profile", icon: User, color: "text-fitness-primary" },
    { path: "/settings", label: "Settings", icon: Settings, color: "text-fitness-secondary" },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-pulse-soft">
          <Flame size={48} className="text-fitness-primary animate-glow" />
        </div>
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-fitness-dark">
        <Sidebar className="border-r border-gray-800/50 bg-gray-900/95 backdrop-blur-md">
          <div className="p-4 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 ml-1">
              <div className="h-9 w-9 bg-gradient-to-br from-fitness-primary to-fitness-secondary rounded-md flex items-center justify-center">
                <span className="text-gray-900 font-bold">LH</span>
              </div>
              <span className="font-bold text-lg gradient-heading">LadderHive</span>
            </div>
          </div>
          
          <SidebarContent className="px-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild
                    className={isActive(item.path) 
                      ? `bg-gray-800/50 ${item.color}`
                      : "text-gray-400 hover:text-white"}
                  >
                    <button
                      onClick={() => navigate(item.path)}
                      className="flex items-center gap-2 w-full group"
                    >
                      <item.icon className={`h-5 w-5 ${isActive(item.path) ? item.color : "text-gray-400 group-hover:text-white"}`} />
                      <span>{item.label}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <div className="mt-auto p-4 border-t border-gray-800/50">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="" alt={userData.name || ""} />
                <AvatarFallback className="bg-gradient-to-br from-fitness-primary to-fitness-secondary text-gray-900 font-medium">
                  {getInitials(userData.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-white">{userData.name}</p>
                <p className="text-xs text-gray-400 truncate">{userData.email}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white hover:bg-gray-800/50"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Sidebar>
        
        <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-black">
          <header className="h-16 border-b border-gray-800/50 bg-gray-900/70 backdrop-blur-sm flex items-center px-4 lg:px-6">
            {isMobile && (
              <SidebarTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800/50">
                  <Menu className="h-5 w-5" />
                </Button>
              </SidebarTrigger>
            )}
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">
                {navItems.find(item => isActive(item.path))?.label || "Dashboard"}
              </h1>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default AppLayout;
