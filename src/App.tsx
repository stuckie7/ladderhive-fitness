
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import ExerciseLibrary from '@/pages/ExerciseLibrary';
import ExerciseDetail from '@/pages/ExerciseDetail';
import WorkoutLibrary from '@/pages/WorkoutLibrary';
import WorkoutDetail from '@/pages/WorkoutDetail';
import CreateWorkout from '@/pages/CreateWorkout';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import ExerciseLibraryEnhanced from '@/pages/ExerciseLibraryEnhanced';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/exercises" element={<ProtectedRoute><ExerciseLibrary /></ProtectedRoute>} />
          <Route path="/exercises/enhanced" element={<ProtectedRoute><ExerciseLibraryEnhanced /></ProtectedRoute>} />
          <Route path="/exercises/:id" element={<ProtectedRoute><ExerciseDetail /></ProtectedRoute>} />
          <Route path="/workouts" element={<ProtectedRoute><WorkoutLibrary /></ProtectedRoute>} />
          <Route path="/workouts/:id" element={<ProtectedRoute><WorkoutDetail /></ProtectedRoute>} />
          <Route path="/workouts/new" element={<ProtectedRoute><CreateWorkout /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          {/* Fallback route */}
          <Route path="*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
