
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, Calendar, BarChart2, BookOpen, Heart, Clock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const menuItems = [
    { icon: Dumbbell, label: 'Exercises', path: '/exercises/enhanced' },
    { icon: Calendar, label: 'Workouts', path: '/workouts' },
    { icon: Heart, label: 'Saved Workouts', path: '/saved-workouts' },
    { icon: Clock, label: 'Mindful Movement', path: '/mindful-movement' },
    { icon: BarChart2, label: 'Progress', path: '/progress' },
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
    { icon: BookOpen, label: 'WODs', path: '/wods' },
  ];

  return (
    <div className="h-full w-64 bg-background border-r border-gray-800 flex flex-col">
      {/* Logo or app name */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Fitness App</h1>
      </div>
      
      {/* Navigation links */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={index}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive(item.path) 
                      ? "bg-gray-800 text-white" 
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Bottom settings section */}
      <div className="p-4 border-t border-gray-800">
        <Link 
          to="/settings" 
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            isActive("/settings") 
              ? "bg-gray-800 text-white" 
              : "text-gray-400 hover:text-white hover:bg-gray-800/50"
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
