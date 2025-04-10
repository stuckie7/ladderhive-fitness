
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import WorkoutDetail from "./pages/WorkoutDetail";
import Profile from "./pages/Profile";
import Schedule from "./pages/Schedule";
import ProgressPage from "./pages/Progress";
import Settings from "./pages/Settings";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import ExerciseDetail from "./pages/ExerciseDetail";
import AdvancedExercises from "./pages/AdvancedExercises";

// Routes protection component
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/workout/:id" element={<WorkoutDetail />} />
              <Route path="/exercises" element={<ExerciseLibrary />} />
              <Route path="/exercises/:id" element={<ExerciseDetail />} />
              <Route path="/advanced-exercises" element={<AdvancedExercises />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
