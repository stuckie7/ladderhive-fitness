
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Dumbbell, Calendar, Activity, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  const menuItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', path: '/admin' },
    { icon: <Users className="h-5 w-5" />, label: 'Users', path: '/admin/users' },
    { icon: <Dumbbell className="h-5 w-5" />, label: 'Workouts', path: '/admin/workouts' },
    { icon: <Calendar className="h-5 w-5" />, label: 'Schedules', path: '/admin/schedules' },
    { icon: <Activity className="h-5 w-5" />, label: 'Analytics', path: '/admin/analytics' },
  ];

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={`w-full justify-start mb-1 text-gray-200 hover:bg-gray-700 hover:text-white transition-colors ${
                window.location.pathname === item.path 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="text-gray-400 group-hover:text-white">
                {React.cloneElement(item.icon, { className: 'h-5 w-5' })}
              </span>
              <span className="ml-2">{item.label}</span>
            </Button>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start mt-6 text-red-400 hover:bg-red-900/50 hover:text-red-200 transition-colors"
            onClick={() => {
              // Handle sign out
              navigate('/');
            }}
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-2">Exit Admin</span>
          </Button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
