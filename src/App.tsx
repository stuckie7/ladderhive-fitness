import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Auth } from '@supabase/ui-react';
import { supabase } from './integrations/supabase/client';
import AppLayout from './components/layout/AppLayout';
import Workouts from './pages/Workouts';
import ExerciseLibrary from './pages/ExerciseLibrary';
import Wods from './pages/Wods';
import WodDetail from './pages/WodDetail';
import WorkoutDetail from './pages/WorkoutDetail';
import WorkoutBuilder from './pages/WorkoutBuilder';
import { AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExerciseDetail from './pages/ExerciseDetail';
import WorkoutInstructions from './pages/WorkoutInstructions';

function App() {
  const [session, setSession] = useState(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user: session?.user }}>
      <Auth.UserContextProvider supabaseClient={supabase} persistSession={true}>
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Workouts />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/exercise-library" element={<ExerciseLibrary />} />
            <Route path="/exercise/:id" element={<ExerciseDetail />} />
            <Route path="/wods" element={<Wods />} />
            <Route path="/wod/:id" element={<WodDetail />} />
            <Route path="/workout/:id" element={<WorkoutDetail />} />
            <Route path="/workout-builder" element={<WorkoutBuilder />} />
            <Route path="/workout-builder/:id" element={<WorkoutBuilder />} />
            
            {/* New route for workout instructions */}
            <Route path="/workout-instructions" element={<WorkoutInstructions />} />
            
            <Route path="*" element={<div>Page not found</div>} />
          </Route>
        </Routes>
      </Auth.UserContextProvider>
    </AuthContext.Provider>
  );
}

export default App;
