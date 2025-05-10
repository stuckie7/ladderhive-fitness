
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import ExercisesFullData from "@/pages/ExercisesFullData";
import ExerciseDetail from "@/pages/ExerciseDetail";
import AdvancedExercises from "@/pages/AdvancedExercises";
import Workouts from "@/pages/Workouts";
import WorkoutDetail from "@/pages/WorkoutDetail";
import Progress from "@/pages/Progress";
import Schedule from "@/pages/Schedule";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ExerciseDetailEnhanced from "@/pages/ExerciseDetailEnhanced";
import ExerciseLibrarySimple from "@/pages/ExerciseLibrarySimple";
import ExerciseLibraryEnhanced from "@/pages/ExerciseLibraryEnhanced";
import WorkoutBuilder from "@/pages/WorkoutBuilder";
import Wods from "@/pages/Wods";
import WodDetail from "@/pages/WodDetail";

function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/exercises-full" element={<ExercisesFullData />} />
          <Route path="/exercise-library" element={<ExerciseLibraryEnhanced />} />
          <Route path="/exercises/:id" element={<ExerciseDetailEnhanced />} />
          <Route path="/exercise-detail/:id" element={<ExerciseDetail />} />
          <Route path="/advanced-exercises" element={<AdvancedExercises />} />
          <Route path="/workout-builder" element={
            <ProtectedRoute>
              <WorkoutBuilder />
            </ProtectedRoute>
          } />
          <Route path="/workout-builder/:id" element={
            <ProtectedRoute>
              <WorkoutBuilder />
            </ProtectedRoute>
          } />
          <Route path="/workouts" element={
            <ProtectedRoute>
              <Workouts />
            </ProtectedRoute>
          } />
          <Route path="/workout/:id" element={
            <ProtectedRoute>
              <WorkoutDetail />
            </ProtectedRoute>
          } />
          {/* New WOD Routes */}
          <Route path="/wods" element={<Wods />} />
          <Route path="/wods/:id" element={<WodDetail />} />
          <Route path="/progress" element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          } />
          <Route path="/schedule" element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </React.StrictMode>
  );
}

export default App;
