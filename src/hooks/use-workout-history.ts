import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface WorkoutHistoryItem {
  id: string
  workout_name: string
  date: string
  duration_minutes: number
  exercises: any[]
  notes: string | null
  created_at: string
}

export function useWorkoutHistory() {
  const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const { data, error } = await supabase
          .from('workout_history')
          .select('*')
          .order('date', { ascending: false })
          .limit(10)

        if (error) throw error

        setWorkouts(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [])

  return { workouts, loading, error }
}
