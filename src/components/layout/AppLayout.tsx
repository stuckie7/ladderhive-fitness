// src/components/layout/AppLayout.tsx
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
  BookOpen,
  Bookmark,
  Zap,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExerciseLibraryNavigation } from '@/hooks/use-exercise-library-navigation';
import { BottomNavigation } from './BottomNavigation';
import { Fab } from '@/components/ui/fab';
import { AppTitle } from '@/components/ui/AppTitle';

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const exerciseNav = useExerciseLibraryNavigation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleExerciseClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    exerciseNav.goToExerciseLibrary();
  };

  // Quick actions for the FAB
  const quickActions = [
    { 
      icon: <Zap size={24} />, 
      label: 'Start Workout', 
      href: '/workout-builder' 
    },
    { 
      icon: <Dumbbell size={24} />, 
      label: 'Exercises', 
      href: '/exercises/enhanced',
      onClick: handleExerciseClick
    },
    { 
      icon: <CalendarDays size={24} />, 
      label: 'Schedule', 
      href: '/schedule' 
    },
    { 
      icon: <LineChart size={24} />, 
      label: 'Progress', 
      href: '/progress' 
    },
    { 
      icon: <BookOpen size={24} />, 
      label: 'WODs', 
      href: '/wods' 
    },
    { 
      icon: <Bookmark size={24} />, 
      label: 'Saved', 
      href: '/saved-workouts' 
    },
  ];

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home size={18} /> },
    { label: 'Exercises', href: '/exercises/enhanced', icon: <Dumbbell size={18} /> },
    { label: 'Workouts', href: '/workouts', icon: <PanelLeft size={18} /> },
    { label: 'Saved Workouts', href: '/saved-workouts', icon: <Bookmark size={18} /> },
    { label: 'Mindful Movement', href: '/mindful-movement', icon: <Zap size={18} /> }, // Using Zap as a temporary replacement since Moon was removed
    { label: 'Progress', href: '/progress', icon: <LineChart size={18} /> },
    { label: 'Schedule', href: '/schedule', icon: <CalendarDays size={18} /> },
    { label: 'WODs', href: '/wods', icon: <BookOpen size={18} /> },
  ];

  const NavItem = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    
    // Special case for Exercise link to use our navigation hook
    if (item.label === 'Exercises') {
      return (
        <a 
          href={item.href}
          onClick={handleExerciseClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-md ${
            active 
              ? 'bg-primary text-primary-foreground font-medium' 
              : 'hover:bg-secondary'
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </a>
      );
    }
    
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
      <div className="w-64 bg-card border-r border-border md:block p-4 hidden">
        <div className="mb-6 px-2">
          <Link to="/" className="flex items-center gap-2 px-2">
            <img src="/fitapp icon 48x48.jpg" alt="FitTrack Logo" className="h-8 w-auto" />
            <AppTitle />
          </Link>
        </div>

        <nav className="space-y-1 mb-6">
          {navItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>

        {/* Moved sign out button and settings to bottom of sidebar with fixed positioning */}
        <div className="fixed bottom-4 left-4 w-56 space-y-2">
          <div className="flex justify-between items-center">
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
            className="w-full flex items-center justify-center gap-2" 
            onClick={handleSignOut}
          >
            <LogOut size={16} />
            Sign out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Bottom Navigation and FAB only on mobile */}
        <BottomNavigation />
        <Fab actions={quickActions} />
      </div>
    </div>
  );
};

export default AppLayout;
