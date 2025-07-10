
// src/components/layout/AppLayout.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
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
  LogOut,
  MessageSquare,
  Flame,
  Calendar,
  Bookmark as BookmarkIcon,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExerciseLibraryNavigation } from '@/hooks/use-exercise-library-navigation';
import { BottomNavigation } from './BottomNavigation';
import { Fab } from '@/components/ui/fab';

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
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

  const handleStartWorkout = async () => {
    try {
      console.log('Starting workout from more menu...');
      
      // Get all available workout types from the correct tables
      const [
        { data: preparedWorkouts, error: preparedError },
        { data: wods, error: wodsError },
        { data: mindfulMovements, error: mindfulError }
      ] = await Promise.all([
        supabase.from('prepared_workouts').select('*').limit(100),
        supabase.from('wods').select('*').limit(100),
        supabase.from('mindful_movements').select('*').limit(100)
      ]);
      
      // Log any errors but continue with available data
      if (preparedError) console.error('Error fetching prepared workouts:', preparedError);
      if (wodsError) console.error('Error fetching WODs:', wodsError);
      if (mindfulError) console.error('Error fetching mindful movements:', mindfulError);
      
      // Filter out any empty or invalid responses
      const allOptions = [
        ...(preparedWorkouts || []).map((w: any) => ({ ...w, type: 'workout' })),
        ...(wods || []).map((w: any) => ({ ...w, type: 'wod' })),
        ...(mindfulMovements || []).map((m: any) => ({ ...m, type: 'mindful' }))
      ].filter(Boolean);
      
      console.log('Available workout options:', allOptions.length);
      
      if (allOptions.length === 0) {
        console.log('No workout options available, redirecting to new workout');
        navigate('/workouts/new');
        return;
      }
      
      // Select a random item
      const randomItem = allOptions[Math.floor(Math.random() * allOptions.length)];
      console.log('Selected random workout:', randomItem);
      
      // Navigate based on the type
      switch (randomItem.type) {
        case 'workout':
          navigate(`/workouts/${randomItem.id}`);
          break;
        case 'wod':
          navigate(`/wods/${randomItem.id}`);
          break;
        case 'mindful':
          navigate(`/mindful-movement/${randomItem.id}`);
          break;
        default:
          navigate('/workouts/new');
      }
    } catch (error) {
      console.error('Error in handleStartWorkout (more menu):', error);
      navigate('/workouts/new');
    }
  };

  // Quick actions for the FAB
  const quickActions = [
    {
      label: 'Create Workout',
      href: '/workout-builder',
      icon: <Dumbbell size={20} />
    },
    {
      label: 'Schedule Workout',
      href: '/schedule',
      icon: <Calendar size={20} />
    }
  ];

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home size={18} /> },
    { label: 'Exercises', href: '/exercises/enhanced', icon: <Dumbbell size={18} /> },
    { label: 'Workouts', href: '/workouts', icon: <PanelLeft size={18} /> },
    { label: 'Saved Workouts', href: '/saved-workouts', icon: <Bookmark size={18} /> },
    { label: 'Forums', href: '/forums', icon: <MessageSquare size={18} /> },
    { label: 'Mindful Movement', href: '/mindful-movement', icon: <Zap size={18} /> },
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
          <Link to="/" className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <img src="/fittrackpro-logo.jpg" alt="FitTrack Pro Logo" className="h-10 w-10 rounded-lg object-cover" />
            </div>
            <h1 className="font-bold text-xl md:hidden" data-lovable-title>FitTrack Pro v.beta</h1>
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
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </div>

        {/* Bottom Navigation and FAB only on mobile */}
        <BottomNavigation />
        <Fab 
          actions={quickActions}
          onStartWorkout={handleStartWorkout}
        />
      </div>
    </div>
  );
};

export default AppLayout;
