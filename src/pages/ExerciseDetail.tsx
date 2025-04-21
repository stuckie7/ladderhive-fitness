import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const { user } = useAuth(); // Assuming you have auth (e.g., Supabase Auth)

  // Fetch exercises from Supabase
  useEffect(() => {
    const fetchExercises = async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });

      if (error) console.error('Error fetching exercises:', error);
      else setExercises(data || []);
    };
    fetchExercises();
  }, []);

  // Toggle exercise selection
  const toggleExercise = (exerciseId: number) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  // Save workout (moderator-only)
  const saveWorkout = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('workouts')
      .insert([{
        name: workoutName,
        exercise_ids: selectedExercises,
        created_by: user.id,
      }]);

    if (error) alert('Error saving workout!');
    else {
      alert('Workout saved!');
      setSelectedExercises([]);
      setWorkoutName('');
    }
  };

  return (
    <div>
      <h1>Exercise Library</h1>
      
      {/* Moderator Workout Builder */}
      {user?.is_moderator && (
        <div className="moderator-tools">
          <input
            type="text"
            placeholder="Workout Name"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
          />
          <button onClick={saveWorkout} disabled={!selectedExercises.length}>
            Save Workout
          </button>
        </div>
      )}

      {/* Exercise List */}
      <div className="exercise-grid">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="exercise-card">
            <input
              type="checkbox"
              checked={selectedExercises.includes(exercise.id)}
              onChange={() => toggleExercise(exercise.id)}
            />
            <a href={`/exercises/${exercise.id}`}>{exercise.name}</a>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Exercise {
  id: number;
  name: string;
  // Add other fields (e.g., `category`, `difficulty`)
}
