
import { createBrowserRouter, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import ExerciseLibraryEnhanced from "./pages/ExerciseLibraryEnhanced";
import ExerciseLibrarySimple from "./pages/ExerciseLibrarySimple";
import ExerciseDetail from "./pages/ExerciseDetail";
import ExerciseDetailEnhanced from "./pages/ExerciseDetailEnhanced";
import ExercisesFullData from "./pages/ExercisesFullData";
import AdvancedExercises from "./pages/AdvancedExercises";
import Workouts from "./pages/Workouts";
import SavedWorkouts from "./pages/SavedWorkouts";
import WorkoutDetail from "./pages/WorkoutDetail";
import WorkoutDetailEnhanced from "./pages/WorkoutDetailEnhanced";
import WorkoutBuilder from "./pages/WorkoutBuilder";
import Wods from "./pages/Wods";
import WodDetail from "./pages/WodDetail";
import MindfulnessPage from "./pages/MindfulnessPage";
import MindfulMovementPage from "./pages/MindfulMovementPage";
import YogaPage from "./pages/YogaPage";
import YogaRoutineDetailPage from "./pages/YogaRoutineDetailPage";
import Onboarding from "./pages/Onboarding";
import BluetoothWearableManager from "./components/BluetoothWearableManager";
import { AssignWorkoutPage } from "./pages/admin/schedules/AssignWorkoutPage";
import MyWorkoutsPage from "./pages/MyWorkouts";
import SuggestedWorkoutsPage from "./pages/SuggestedWorkoutsPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { UsersPage } from "./pages/admin/UsersPage";
import { UserDetailPage } from "./pages/admin/UserDetailPage";
import { NewUserPage } from "./pages/admin/users/NewUserPage";
import { NewWorkoutPage } from "./pages/admin/workouts/NewWorkoutPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import WorkoutScheduleManager from "./pages/admin/WorkoutScheduleManager";
import { useAdmin } from "./context/AdminContext";
import { useEffect, useState } from "react";

// Forum pages
import Forums from "@/pages/Forums";
import ForumCategory from "@/pages/ForumCategory";
import ForumThread from "@/pages/ForumThread";
import NewPost from "@/pages/NewPost";
import NewThread from "@/pages/NewThread";
import EditPost from "@/pages/EditPost";
import DebugForum from "@/pages/DebugForum";
import ForumDebugPage from "@/pages/ForumDebugPage";

// Admin Route Wrapper Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { isAdmin: checkAdmin } = useAdmin();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const adminStatus = await checkAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error verifying admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    verifyAdmin();
  }, [checkAdmin]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Create a router with all routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/signup",
    element: <Signup />
  },
  // Admin routes - Protected by both authentication and admin role
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <DashboardPage />
        </AdminRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <UsersPage />
        </AdminRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users/new",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <NewUserPage />
        </AdminRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users/:userId",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <UserDetailPage />
        </AdminRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/workouts",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <AdminLayout>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Workout Templates</h1>
                <button
                  onClick={() => window.location.href = '/admin/workouts/new'}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                >
                  Create New Template
                </button>
              </div>
              <p className="text-muted-foreground">Manage workout templates that can be assigned to users</p>
            </div>
          </AdminLayout>
        </AdminRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/workouts/new",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <NewWorkoutPage />
        </AdminRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/schedules",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <WorkoutScheduleManager />
        </AdminRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/schedules/assign",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <AssignWorkoutPage />
        </AdminRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/analytics",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <AdminLayout>
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-6">Analytics</h1>
              <p>Analytics dashboard coming soon...</p>
            </div>
          </AdminLayout>
        </AdminRoute>
      </ProtectedRoute>
    ),
  },
  // Protected routes - AuthProvider validation happens in the ProtectedRoute component
  {
    path: "/onboarding",
    element: <ProtectedRoute><Onboarding /></ProtectedRoute>
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>
  },
  {
    path: "/profile",
    element: <ProtectedRoute><Profile /></ProtectedRoute>
  },
  {
    path: "/progress",
    element: <ProtectedRoute><Progress /></ProtectedRoute>
  },
  {
    path: "/schedule",
    element: <ProtectedRoute><Schedule /></ProtectedRoute>
  },
  {
    path: "/my-workouts",
    element: <ProtectedRoute><MyWorkoutsPage /></ProtectedRoute>
  },
  {
    path: "/suggested-workouts",
    element: <ProtectedRoute><SuggestedWorkoutsPage /></ProtectedRoute>
  },
  {
    path: "/settings",
    element: <ProtectedRoute><Settings /></ProtectedRoute>
  },
  // Exercise routes
  {
    path: "/exercises",
    element: <ExerciseLibrary />
  },
  {
    path: "/exercises/enhanced",
    element: <ExerciseLibraryEnhanced />
  },
  {
    path: "/exercises/simple",
    element: <ExerciseLibrarySimple />
  },
  {
    path: "/exercises/:id",
    element: <ExerciseDetail />
  },
  {
    path: "/exercises/enhanced/:id",
    element: <ExerciseDetailEnhanced />
  },
  {
    path: "/exercises/full-data",
    element: <ExercisesFullData />
  },
  {
    path: "/exercises/advanced",
    element: <AdvancedExercises />
  },
  // Workout routes
  {
    path: "/workouts",
    element: <Workouts />
  },
  {
    path: "/saved-workouts",
    element: <ProtectedRoute><SavedWorkouts /></ProtectedRoute>
  },
  {
    path: "/workouts/:id",
    element: <WorkoutDetail />
  },
  {
    path: "/workouts/enhanced/:id",
    element: <WorkoutDetailEnhanced />
  },
  {
    path: "/workout-builder",
    element: <ProtectedRoute><WorkoutBuilder /></ProtectedRoute>
  },
  {
    path: "/workout-builder/:id",
    element: <ProtectedRoute><WorkoutBuilder /></ProtectedRoute>
  },
  // WOD routes
  {
    path: "/wods",
    element: <Wods />
  },
  {
    path: "/wods/:id",
    element: <WodDetail />
  },
  // Mindfulness and Yoga
  {
    path: "/mindfulness",
    element: <MindfulnessPage />
  },
  {
    path: "/mindful-movement",
    element: <MindfulMovementPage />
  },
  {
    path: "/yoga",
    element: <YogaPage />
  },
  {
    path: "/yoga/:id",
    element: <YogaRoutineDetailPage />
  },
  {
    path: "/bluetooth-devices",
    element: <ProtectedRoute><BluetoothWearableManager /></ProtectedRoute>
  },
  // Forum routes
  {
    path: "/forums",
    element: <Forums />
  },
  {
    path: "/forums/category/:categorySlug",
    element: <ForumCategory />
  },
  {
    path: "/forums/thread/:threadSlug",
    element: <ForumThread />
  },
  {
    path: "/forums/thread/:threadSlug/new",
    element: <ProtectedRoute><NewPost /></ProtectedRoute>
  },
  {
    path: "/forums/thread/:threadSlug/reply",
    element: <ProtectedRoute><NewPost /></ProtectedRoute>
  },
  {
    path: "/forums/thread/:threadSlug/edit/:postId",
    element: <ProtectedRoute><EditPost /></ProtectedRoute>
  },
  {
    path: "/forums/new-thread/:categoryId?",
    element: <ProtectedRoute><NewThread /></ProtectedRoute>
  },
  // Debug routes - remove in production
  {
    path: "/debug/forum",
    element: <DebugForum />
  },
  {
    path: "/forum-debug",
    element: <ForumDebugPage />
  }
]);

export default router;
