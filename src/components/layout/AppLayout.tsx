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
  Menu
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
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/workouts", label: "Workouts", icon: Dumbbell },
    { path: "/progress", label: "Progress", icon: BarChart3 },
    { path: "/schedule", label: "Schedule", icon: Calendar },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/settings", label: "Settings", icon: Settings },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-gray-200 dark:border-gray-800">
          <div className="p-4 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 ml-1">
              <div className="h-8 w-8 bg-fitness-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold">LH</span>
              </div>
              <span className="font-bold text-lg">LadderHive</span>
            </div>
          </div>
          
          <SidebarContent className="px-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild
                    className={isActive(item.path) ? "bg-fitness-primary/10 text-fitness-primary" : ""}
                  >
                    <button
                      onClick={() => navigate(item.path)}
                      className="flex items-center gap-2 w-full"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="" alt={userData.name || ""} />
                <AvatarFallback className="bg-fitness-primary text-white">
                  {getInitials(userData.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{userData.name}</p>
                <p className="text-xs text-muted-foreground truncate">{userData.email}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Sidebar>
        
        <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
          <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 lg:px-6">
            {isMobile && (
              <SidebarTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SidebarTrigger>
            )}
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
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
