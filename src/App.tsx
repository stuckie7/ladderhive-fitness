
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Onboarding from '@/pages/Onboarding';
import ExerciseLibrary from '@/pages/ExerciseLibrary';
import ExerciseDetail from '@/pages/ExerciseDetail';
import Workouts from '@/pages/Workouts';
import WorkoutDetail from '@/pages/WorkoutDetail';
import Schedule from '@/pages/Schedule';
import Progress from '@/pages/Progress';
import Settings from '@/pages/Settings';
import ExerciseImport from '@/pages/ExerciseImport';

// Components
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Context
import { AuthProvider } from '@/context/AuthContext';

// Create a react-query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
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
            <Route path="/exercises" element={
              <ProtectedRoute>
                <ExerciseLibrary />
              </ProtectedRoute>
            } />
            <Route path="/exercises/import" element={
              <ProtectedRoute>
                <ExerciseImport />
              </ProtectedRoute>
            } />
            <Route path="/exercises/:id" element={
              <ProtectedRoute>
                <ExerciseDetail />
              </ProtectedRoute>
            } />
            <Route path="/workouts" element={
              <ProtectedRoute>
                <Workouts />
              </ProtectedRoute>
            } />
            <Route path="/workouts/:id" element={
              <ProtectedRoute>
                <WorkoutDetail />
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
