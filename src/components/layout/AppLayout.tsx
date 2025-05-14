
import {
  LayoutDashboard,
  Settings,
  User,
  Dumbbell,
  ListFilter,
  LineChart,
  Timer,
  Leaf,
  Moon,
  Brain,
} from "lucide-react";
import { NavItem } from "@/components/layout/NavItem";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar navigation */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {/* App title */}
          <div className="text-lg font-semibold text-gray-900 dark:text-white mb-8">
            Fitness App
          </div>

          {/* Main navigation */}
          <div className="space-y-1">
            <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
            <NavItem to="/workouts" icon={Dumbbell}>Workouts</NavItem>
            <NavItem to="/exercises" icon={ListFilter}>Exercises</NavItem>
            <NavItem to="/progress" icon={LineChart}>Progress</NavItem>
            <NavItem to="/wods" icon={Timer}>WODs</NavItem>
            <NavItem to="/mindful-movement" icon={Leaf}>Mindful Movement</NavItem>
            <NavItem to="/yoga" icon={Moon}>Yoga</NavItem>
            <NavItem to="/mindfulness" icon={Brain}>Mindfulness</NavItem>
          </div>

          {/* Account navigation */}
          <div className="space-y-1 mt-8">
            <NavItem to="/profile" icon={User}>Profile</NavItem>
            <NavItem to="/settings" icon={Settings}>Settings</NavItem>
          </div>

          {/* Logout button */}
          <div className="mt-8">
            <button
              onClick={signOut}
              className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 focus:outline-none"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800">
        <main className="relative py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
