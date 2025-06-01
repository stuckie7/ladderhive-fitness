import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, User, Menu, Bluetooth, Sparkles, Flame, HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useExerciseLibraryNavigation } from '@/hooks/use-exercise-library-navigation';
import { AdminNavLink } from './AdminNavLink';

export function BottomNavigation() {
  const location = useLocation();
  const exerciseNav = useExerciseLibraryNavigation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleExerciseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    exerciseNav.goToExerciseLibrary();
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm z-40 shadow-lg">
      <nav className="flex justify-between items-center px-1 py-1.5 sm:px-2">
        {/* Home */}
        <Link 
          to="/dashboard" 
          className={cn(
            "flex flex-col items-center p-2 rounded-lg transition-colors",
            isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50'
          )}
        >
          <Home size={22} className="mb-0.5" />
          <span className="text-[10px] sm:text-xs font-medium">Home</span>
        </Link>
        
        {/* Exercises */}
        <a 
          href="/exercises/enhanced" 
          onClick={handleExerciseClick}
          className={cn(
            "flex flex-col items-center p-2 rounded-lg transition-colors",
            isActive('/exercises') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50'
          )}
        >
          <Dumbbell size={22} className="mb-0.5" />
          <span className="text-[10px] sm:text-xs font-medium">Exercises</span>
        </a>
        
        {/* WOD */}
        <Link 
          to="/wods" 
          className={cn(
            "flex flex-col items-center p-2 rounded-lg transition-colors",
            isActive('/wods') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50'
          )}
        >
          <Flame size={22} className="mb-0.5" />
          <span className="text-[10px] sm:text-xs font-medium">WOD</span>
        </Link>
        
        {/* Devices */}
        <Link 
          to="/bluetooth-devices" 
          className={cn(
            "flex flex-col items-center p-2 rounded-lg transition-colors",
            isActive('/bluetooth-devices') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50'
          )}
        >
          <Bluetooth size={22} className="mb-0.5" />
          <span className="text-[10px] sm:text-xs font-medium">Devices</span>
        </Link>
        
        {/* Workouts */}
        <Link 
          to="/workouts" 
          className={cn(
            "flex flex-col items-center p-2 rounded-lg transition-colors",
            isActive('/workouts') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50'
          )}
        >
          <Dumbbell size={22} className="mb-0.5" />
          <span className="text-[10px] sm:text-xs font-medium">Workouts</span>
        </Link>
        
        {/* Mindful */}
        <Link 
          to="/mindful" 
          className={cn(
            "flex flex-col items-center p-2 rounded-lg transition-colors",
            isActive('/mindful') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50'
          )}
        >
          <HeartPulse size={22} className="mb-0.5" />
          <span className="text-[10px] sm:text-xs font-medium">Mindful</span>
        </Link>
        
        {/* More Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "flex flex-col items-center p-2 h-auto rounded-lg transition-colors",
                isActive('/more') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50'
              )}
            >
              <Menu size={22} className="mb-0.5" />
              <span className="text-[10px] sm:text-xs font-medium">More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl overflow-y-auto">
            <div className="grid grid-cols-2 gap-4 mt-4 p-4">
              <Link to="/my-workouts" className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent transition-colors">
                <Sparkles size={24} />
                <span className="mt-2 text-sm font-medium">For You</span>
              </Link>
              <Link to="/profile" className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent transition-colors">
                <User size={24} />
                <span className="mt-2 text-sm font-medium">Profile</span>
              </Link>
              <div className="col-span-2">
                <AdminNavLink />
              </div>
              <Link to="/workouts" className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent transition-colors">
                <Dumbbell size={24} />
                <span className="mt-2 text-sm font-medium">Workouts</span>
              </Link>
              <Link to="/saved-workouts" className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent transition-colors">
                <Dumbbell size={24} />
                <span className="mt-2 text-sm font-medium">Saved</span>
              </Link>
              <Link to="/schedule" className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent transition-colors">
                <Home size={24} />
                <span className="mt-2 text-sm font-medium">Schedule</span>
              </Link>
              <Link to="/settings" className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent transition-colors">
                <Home size={24} />
                <span className="mt-2 text-sm font-medium">Settings</span>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
