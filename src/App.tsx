import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AdminProvider } from '@/context/AdminContext';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Profile from '@/pages/Profile';
import Layout from '@/components/Layout';
import Workouts from '@/pages/Workouts';
import WorkoutBuilder from '@/pages/WorkoutBuilder';
import WorkoutPlayer from '@/pages/WorkoutPlayer';
import Schedule from '@/pages/Schedule';
import ExerciseLibraryEnhanced from '@/pages/ExerciseLibraryEnhanced';
import WorkoutDetail from '@/pages/WorkoutDetail';
import Wods from '@/pages/Wods';
import WodDetail from '@/pages/WodDetail';
import MindfulMovementPage from '@/pages/MindfulMovementPage';
import SavedWorkouts from '@/pages/SavedWorkouts';
import Forums from '@/pages/Forums';
import Progress from '@/pages/Progress';
import ForumCategory from '@/pages/ForumCategory';
import ForumThread from '@/pages/ForumThread';
import NewThread from '@/pages/NewThread';
import ExerciseDetailPage from '@/pages/ExerciseDetailPage'; // Added import

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (for auth pages when already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <Toaster />
          <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="workouts/:id" element={<WorkoutDetail />} />
            <Route path="workout-builder" element={<WorkoutBuilder />} />
            <Route path="workout-player/:id" element={<WorkoutPlayer />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="exercises/enhanced" element={<ExerciseLibraryEnhanced />} />
            <Route path="wods" element={<Wods />} />
            <Route path="wods/:id" element={<WodDetail />} />
            <Route path="mindful-movement" element={<MindfulMovementPage />} />
            <Route path="mindful-movement/:id" element={<MindfulMovementPage />} />
            <Route path="saved-workouts" element={<SavedWorkouts />} />
            <Route path="forums" element={<Forums />} />
            {/* Forums */}
            <Route path="forums" element={<Forums />} />
            {/* handle /forums/category/:slug links */}
            <Route path="forums/category/:slug" element={<ForumCategory />} />
            {/* fallback legacy route /forums/:category */}
            <Route path="forums/:category" element={<ForumCategory />} />
            {/* New thread (optional category param) */}
            <Route path="forums/new-thread" element={<NewThread />} />
            <Route path="forums/new-thread/:categoryId" element={<NewThread />} />

            {/* thread by slug (preferred) or numeric id (legacy) */}
            <Route path="forums/thread/:threadSlug" element={<ForumThread />} />
            <Route path="forums/thread/:id" element={<ForumThread />} />
            <Route path="progress" element={<Progress />} />
            <Route path="exercises/enhanced/:exerciseId" element={<ExerciseDetailPage />} />
          </Route>
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
