
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { House, Dumbbell, Flame, Clock, MessageSquare, Menu, List, Bookmark, Calendar, PlayCircle, User, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useExerciseLibraryNavigation } from '@/hooks/use-exercise-library-navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminNavLink } from './AdminNavLink';

export function BottomNavigation() {
  const location = useLocation();
  const exerciseNav = useExerciseLibraryNavigation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleExerciseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    exerciseNav.goToExerciseLibrary();
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm z-40 shadow-lg">
      <nav className="flex justify-between items-center px-1 py-1.5 sm:px-2" role="navigation" aria-label="Main navigation">
        {/* Home */}
        <Link 
          to="/dashboard" 
          className={cn(
            "flex flex-col items-center p-2 rounded-lg transition-colors",
            isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50'
          )}
          aria-label="Home - Dashboard"
        >
          <House size={22} className="mb-0.5" />
          <span className="text-[10px] sm:text-xs font-medium">Home</span>
        </Link>
        
        {/* Workouts */}
        <Link 
          to="/workouts" 
          className={cn(
            "flex flex-col items-center p-2 rounded-lg transition-colors",
            isActive('/workouts') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50'
          )}
          aria-label="Workouts"
        >
          <Dumbbell size={22} className="mb-0.5" />
          <span className="text-[10px] sm:text-xs font-medium">Workouts</span>
        </Link>
        
        {/* WOD */}
        <Link 
          to="/wods" 
          className={cn(
            "flex flex-col items-center p-2 rounded-lg transition-colors",
            isActive('/wods') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50'
          )}
          aria-label="Workout of the Day"
        >
          <Flame size={22} className="mb-0.5" />
          <span className="text-[10px] sm:text-xs font-medium">WOD</span>
        </Link>
        
        {/* Recovery */}
        <Link 
          to="/mindful-movement" 
          className={cn(
            "flex flex-col items-center p-2 rounded-lg transition-colors",
            isActive('/mindful-movement') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50'
          )}
          aria-label="Recovery and mindful movement"
        >
          <Clock size={22} className="mb-0.5" />
          <span className="text-[10px] sm:text-xs font-medium">Recovery</span>
        </Link>
        
        {/* Forums */}
        <Link 
          to="/forums" 
          className={cn(
            "flex flex-col items-center p-2 rounded-lg transition-colors",
            isActive('/forums') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50'
          )}
          aria-label="Community forums"
        >
          <MessageSquare size={22} className="mb-0.5" />
          <span className="text-[10px] sm:text-xs font-medium">Forums</span>
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
              aria-label="Open more menu options"
              aria-haspopup="dialog"
              aria-expanded="false"
            >
              <Menu size={22} className="mb-0.5" aria-hidden="true" />
              <span className="text-[10px] sm:text-xs font-medium">More</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="bottom" 
            className="h-[70vh] rounded-t-2xl overflow-y-auto"
            role="dialog"
            aria-label="More menu options"
          >
            <SheetHeader className="mb-6">
              {user && (
                <div className="flex items-center gap-4 p-4 bg-accent/20 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.user_metadata?.full_name || user.email} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.user_metadata?.full_name || user.email?.split('@')[0] || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold">{user.user_metadata?.full_name || user.email?.split('@')[0]}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}
            </SheetHeader>
            
            {/* Start Workout - Prominently placed */}
            <div className="mb-6">
              <Link 
                to="/workout-builder" 
                className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                aria-label="Start a new workout session"
              >
                <PlayCircle size={24} className="text-primary" aria-hidden="true" />
                <span className="text-lg font-semibold text-primary">Start Workout</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4" role="grid" aria-label="App features">
              <a 
                href="/exercises/enhanced" 
                onClick={handleExerciseClick}
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent transition-colors"
                role="gridcell"
                aria-label="Browse exercise library"
              >
                <List size={24} aria-hidden="true" />
                <span className="mt-2 text-sm font-medium">Exercises</span>
              </a>
              
              <Link 
                to="/saved-workouts" 
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent transition-colors"
                role="gridcell"
                aria-label="View saved workouts"
              >
                <Bookmark size={24} aria-hidden="true" />
                <span className="mt-2 text-sm font-medium">Saved</span>
              </Link>
              
              <Link 
                to="/schedule" 
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent transition-colors"
                role="gridcell"
                aria-label="View workout schedule"
              >
                <Calendar size={24} aria-hidden="true" />
                <span className="mt-2 text-sm font-medium">Schedule</span>
              </Link>
              
              <Link 
                to="/progress" 
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent transition-colors"
                role="gridcell"
                aria-label="View your progress"
              >
                <TrendingUp size={24} aria-hidden="true" />
                <span className="mt-2 text-sm font-medium">Progress</span>
              </Link>

              <Link 
                to="/profile" 
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent transition-colors"
                role="gridcell"
                aria-label="View user profile and settings"
              >
                <User size={24} aria-hidden="true" />
                <span className="mt-2 text-sm font-medium">Profile</span>
              </Link>
              
              <div className="col-span-1" role="gridcell">
                <AdminNavLink />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
