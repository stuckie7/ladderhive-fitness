
import { createBrowserRouter } from "react-router-dom";
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
  }
]);

export default router;
