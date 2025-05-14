
import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import ExercisesPage from "@/pages/ExerciseLibraryEnhanced";
import ExerciseDetailPage from "@/pages/ExerciseDetailEnhanced";
import WorkoutBuilder from "@/pages/WorkoutBuilder";
import WorkoutDetail from "@/pages/WorkoutDetail";
import SignupPage from "@/pages/Signup";
import LoginPage from "@/pages/Login";
import ProfilePage from "@/pages/Profile";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OnboardingPage from "@/pages/Onboarding";
import WorkoutsPage from "@/pages/Workouts";
import ProgressPage from "@/pages/Progress";
import WodsPage from "@/pages/Wods";
import WodDetailPage from "@/pages/WodDetail";
import NutritionPage from "@/pages/NotFound"; // Temporary fallback
import WorkoutDetailEnhanced from "@/pages/WorkoutDetailEnhanced";
import MindfulnessPage from "@/pages/MindfulnessPage";
import YogaRoutineDetailPage from "@/pages/YogaRoutineDetailPage";
import YogaPage from "@/pages/YogaPage";
import MindfulMovementPage from "@/pages/MindfulMovementPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/exercises" element={<ProtectedRoute><ExercisesPage /></ProtectedRoute>} />
      <Route path="/exercises/:id" element={<ProtectedRoute><ExerciseDetailPage /></ProtectedRoute>} />
      <Route path="/workouts" element={<ProtectedRoute><WorkoutsPage /></ProtectedRoute>} />
      <Route path="/workouts/:id" element={<ProtectedRoute><WorkoutDetail /></ProtectedRoute>} />
      <Route path="/workouts/enhanced/:id" element={<ProtectedRoute><WorkoutDetailEnhanced /></ProtectedRoute>} />
      <Route path="/workout-builder" element={<ProtectedRoute><WorkoutBuilder /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
      <Route path="/wods" element={<ProtectedRoute><WodsPage /></ProtectedRoute>} />
      <Route path="/wods/:id" element={<ProtectedRoute><WodDetailPage /></ProtectedRoute>} />
      <Route path="/nutrition" element={<ProtectedRoute><NutritionPage /></ProtectedRoute>} />
      
      {/* Mindfulness and Yoga routes */}
      <Route path="/mindfulness" element={<ProtectedRoute><MindfulnessPage /></ProtectedRoute>} />
      <Route path="/mindfulness/routine/:id" element={<ProtectedRoute><YogaRoutineDetailPage /></ProtectedRoute>} />
      <Route path="/yoga" element={<ProtectedRoute><YogaPage /></ProtectedRoute>} />
      
      {/* Mindful Movement route */}
      <Route path="/mindful-movement" element={<ProtectedRoute><MindfulMovementPage /></ProtectedRoute>} />
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
