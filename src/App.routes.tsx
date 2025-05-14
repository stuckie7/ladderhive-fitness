
import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import ExercisesPage from "@/pages/ExercisesPage";
import ExerciseDetailPage from "@/pages/ExerciseDetailPage";
import WorkoutBuilder from "@/pages/WorkoutBuilder";
import WorkoutDetail from "@/pages/WorkoutDetail";
import SignupPage from "@/pages/SignupPage";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OnboardingPage from "@/pages/OnboardingPage";
import WorkoutsPage from "@/pages/WorkoutsPage";
import ProgressPage from "@/pages/ProgressPage";
import WodsPage from "@/pages/WodsPage";
import WodDetailPage from "@/pages/WodDetailPage";
import NutritionPage from "@/pages/NutritionPage";
import WorkoutDetailEnhanced from "@/pages/WorkoutDetailEnhanced";
import MindfulnessPage from "@/pages/MindfulnessPage";
import YogaRoutineDetailPage from "@/pages/YogaRoutineDetailPage";

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
      
      {/* New mindfulness routes */}
      <Route path="/mindfulness" element={<ProtectedRoute><MindfulnessPage /></ProtectedRoute>} />
      <Route path="/mindfulness/routine/:id" element={<ProtectedRoute><YogaRoutineDetailPage /></ProtectedRoute>} />
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
