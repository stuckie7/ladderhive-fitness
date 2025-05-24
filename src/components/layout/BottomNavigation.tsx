
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Dumbbell, LineChart, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useExerciseLibraryNavigation } from '@/hooks/use-exercise-library-navigation';

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
      <nav className="flex justify-between items-center p-2">
        <Link to="/dashboard" className="flex flex-col items-center py-1 px-3 space-y-1">
          <Home 
            size={20} 
            className={cn(
              isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
            )} 
          />
          <span className="text-xs font-medium">Home</span>
        </Link>
        
        <a 
          href="/exercises/enhanced" 
          onClick={handleExerciseClick}
          className="flex flex-col items-center py-1 px-3 space-y-1"
        >
          <Dumbbell 
            size={20} 
            className={cn(
              isActive('/exercises') ? 'text-primary' : 'text-muted-foreground'
            )} 
          />
          <span className="text-xs font-medium">Exercises</span>
        </a>
        
        <Link to="/progress" className="flex flex-col items-center py-1 px-3 space-y-1">
          <LineChart 
            size={20} 
            className={cn(
              isActive('/progress') ? 'text-primary' : 'text-muted-foreground'
            )} 
          />
          <span className="text-xs font-medium">Progress</span>
        </Link>
        
        <Link to="/bluetooth-devices" className="flex flex-col items-center py-1 px-3 space-y-1">
          <Bluetooth 
            size={20} 
            className={cn(
              isActive('/bluetooth-devices') ? 'text-primary' : 'text-muted-foreground'
            )} 
          />
          <span className="text-xs font-medium">Devices</span>
        </Link>
        
        <Link to="/profile" className="flex flex-col items-center py-1 px-3 space-y-1">
          <User 
            size={20} 
            className={cn(
              isActive('/profile') ? 'text-primary' : 'text-muted-foreground'
            )} 
          />
          <span className="text-xs font-medium">Profile</span>
        </Link>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="flex flex-col items-center py-1 px-3 space-y-1 h-auto">
              <Menu 
                size={20}
                className="text-muted-foreground" 
              />
              <span className="text-xs font-medium">More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Link to="/workouts" className="flex flex-col items-center p-4 border rounded-lg">
                <Dumbbell size={24} />
                <span className="mt-2 text-sm font-medium">Workouts</span>
              </Link>
              <Link to="/saved-workouts" className="flex flex-col items-center p-4 border rounded-lg">
                <Dumbbell size={24} />
                <span className="mt-2 text-sm font-medium">Saved</span>
              </Link>
              <Link to="/schedule" className="flex flex-col items-center p-4 border rounded-lg">
                <Home size={24} />
                <span className="mt-2 text-sm font-medium">Schedule</span>
              </Link>
              <Link to="/mindful-movement" className="flex flex-col items-center p-4 border rounded-lg">
                <Home size={24} />
                <span className="mt-2 text-sm font-medium">Mindful</span>
              </Link>
              <Link to="/wods" className="flex flex-col items-center p-4 border rounded-lg">
                <Home size={24} />
                <span className="mt-2 text-sm font-medium">WODs</span>
              </Link>
              <Link to="/settings" className="flex flex-col items-center p-4 border rounded-lg">
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
