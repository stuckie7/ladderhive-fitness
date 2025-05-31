
import { ReactNode } from 'react';
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="p-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={`w-full justify-start mb-1 ${window.location.pathname === item.path ? 'bg-accent' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Button>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start mt-4 text-red-600 hover:text-red-700 hover:bg-red-50"
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
