
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { supabase } from './integrations/supabase/client';
import AppLayout from './components/layout/AppLayout';
import Workouts from './pages/Workouts';
import ExerciseLibrary from './pages/ExerciseLibrary';
import Wods from './pages/Wods';
import WodDetail from './pages/WodDetail';
import WorkoutDetail from './pages/WorkoutDetail';
import WorkoutBuilder from './pages/WorkoutBuilder';
import { AuthContext } from './context/AuthContext';
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
    <AuthContext.Provider value={{ 
      session, 
      user: session?.user,
      signIn: async () => {}, // These are placeholders - the real implementations are in AuthContext.tsx
      signUp: async () => {}, 
      signOut: async () => {},
      loading: false
    }}>
      <div>
        <Routes>
          <Route path="/" element={
            <AppLayout>
              <Workouts />
            </AppLayout>
          } />
          <Route path="/workouts" element={
            <AppLayout>
              <Workouts />
            </AppLayout>
          } />
          <Route path="/exercise-library" element={
            <AppLayout>
              <ExerciseLibrary />
            </AppLayout>
          } />
          <Route path="/exercise/:id" element={
            <AppLayout>
              <ExerciseDetail />
            </AppLayout>
          } />
          <Route path="/wods" element={
            <AppLayout>
              <Wods />
            </AppLayout>
          } />
          <Route path="/wod/:id" element={
            <AppLayout>
              <WodDetail />
            </AppLayout>
          } />
          <Route path="/workout/:id" element={
            <AppLayout>
              <WorkoutDetail />
            </AppLayout>
          } />
          <Route path="/workout-builder" element={
            <AppLayout>
              <WorkoutBuilder />
            </AppLayout>
          } />
          <Route path="/workout-builder/:id" element={
            <AppLayout>
              <WorkoutBuilder />
            </AppLayout>
          } />
          
          {/* New route for workout instructions */}
          <Route path="/workout-instructions" element={
            <AppLayout>
              <WorkoutInstructions />
            </AppLayout>
          } />
          
          <Route path="*" element={
            <AppLayout>
              <div>Page not found</div>
            </AppLayout>
          } />
        </Routes>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
