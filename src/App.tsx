
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import ExerciseLibrary from "@/pages/ExerciseLibrary";
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

// Update the route section to include our new simple exercise library route
const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <Onboarding />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/exercises",
    element: <ExerciseLibrary />,
  },
  {
    path: "/exercises-simple",
    element: <ExerciseLibrarySimple />,
  },
  {
    path: "/exercises-full",
    element: <ExercisesFullData />,
  },
  {
    path: "/exercises/:id",
    element: <ExerciseDetailEnhanced />,
  },
  {
    path: "/exercise-detail/:id",
    element: <ExerciseDetail />,
  },
  {
    path: "/advanced-exercises",
    element: <AdvancedExercises />,
  },
  {
    path: "/workouts",
    element: (
      <ProtectedRoute>
        <Workouts />
      </ProtectedRoute>
    ),
  },
  {
    path: "/workouts/:id",
    element: (
      <ProtectedRoute>
        <WorkoutDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/progress",
    element: (
      <ProtectedRoute>
        <Progress />
      </ProtectedRoute>
    ),
  },
  {
    path: "/schedule",
    element: (
      <ProtectedRoute>
        <Schedule />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </React.StrictMode>
  );
}

export default App;
