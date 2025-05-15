
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, 
  Dumbbell, 
  LineChart, 
  CalendarDays, 
  Settings, 
  User,
  PanelLeft,
  Moon, 
  BookOpen,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems: NavItem[] = [
    { label: 'Home', href: '/dashboard', icon: <Home size={18} /> },
    { label: 'Exercises', href: '/exercises', icon: <Dumbbell size={18} /> },
    { label: 'Workouts', href: '/workouts', icon: <PanelLeft size={18} /> },
    { label: 'Saved Workouts', href: '/saved-workouts', icon: <Bookmark size={18} /> },
    { label: 'Mindful Movement', href: '/mindful-movement', icon: <Moon size={18} /> },
    { label: 'Progress', href: '/progress', icon: <LineChart size={18} /> },
    { label: 'Schedule', href: '/schedule', icon: <CalendarDays size={18} /> },
    { label: 'WODs', href: '/wods', icon: <BookOpen size={18} /> },
  ];

  const NavItem = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    return (
      <Link 
        to={item.href} 
        className={`flex items-center gap-2 px-3 py-2 rounded-md ${
          active 
            ? 'bg-primary text-primary-foreground font-medium' 
            : 'hover:bg-secondary'
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border hidden md:block p-4">
        <div className="mb-6 px-2">
          <h1 className="font-bold text-xl">FitTrack Pro</h1>
        </div>

        <nav className="space-y-1 mb-6">
          {navItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <div className="flex justify-between items-center">
            <ThemeToggle />
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <Settings size={18} />
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User size={18} />
              </Button>
            </Link>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden sticky top-0 z-30 w-full bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="p-4 flex justify-between items-center">
          <h1 className="font-bold">FitTrack Pro</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Mobile menu button could go here */}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
