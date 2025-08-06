import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Calendar } from '@/components/ui/calendar'; // Using Input type="date" for simplicity
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout'; // Corrected path

interface UserProfile {
  id: string;
  email: string | undefined;
  first_name: string | null;
  last_name: string | null;
}

interface SuggestedWorkout {
  id: string;
  name: string;
  difficulty: string;
  duration: number;
}

export default function AssignWorkoutPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [workouts, setWorkouts] = useState<SuggestedWorkout[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setPageLoading(true);
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles') // Assuming your user profiles table is named 'profiles'
          .select('id, email, first_name, last_name')
          .order('last_name');

        if (usersError) throw usersError;

        const { data: workoutsData, error: workoutsError } = await supabase
          .from('suggested_workouts')
          .select('id, name, difficulty, duration')
          .order('name');

        if (workoutsError) throw workoutsError;

        setUsers(usersData || []);
        setWorkouts(workoutsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error Loading Data',
          description: (error as Error).message || 'Failed to load users and workouts. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleAssignWorkout = async () => {
    if (!selectedUserId || !selectedWorkoutId || !scheduledDate) {
      toast({
        title: 'Missing Information',
        description: 'Please select a user, workout, and date.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_workouts')
        .insert([
          {
            user_id: selectedUserId,
            workout_id: selectedWorkoutId,
            scheduled_date: scheduledDate.toISOString(), // Store as full timestamp
            status: 'scheduled',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Workout Assigned!',
        description: `Successfully assigned workout to user.`,
      });
      // Optionally reset form or navigate away
      setSelectedWorkoutId('');
      // setScheduledDate(new Date()); // Keep date or reset as preferred
    } catch (error) {
      console.error('Error assigning workout:', error);
      toast({
        title: 'Assignment Failed',
        description: (error as Error).message || 'Could not assign the workout. Please check for conflicts or try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Assign Workout to User</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Select a user, choose a workout, and set a date to schedule it.
          </p>
        </header>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 space-y-6 max-w-2xl mx-auto">
          <div className="space-y-2">
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select User
            </label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger id="user-select" className="w-full">
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Unnamed User'} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="workout-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Workout
            </label>
            <Select value={selectedWorkoutId} onValueChange={setSelectedWorkoutId}>
              <SelectTrigger id="workout-select" className="w-full">
                <SelectValue placeholder="Select a workout..." />
              </SelectTrigger>
              <SelectContent>
                {workouts.map((workout) => (
                  <SelectItem key={workout.id} value={workout.id}>
                    {workout.name} ({workout.difficulty}, {workout.duration} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="scheduled-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Scheduled Date
            </label>
            <Input
              id="scheduled-date"
              type="date"
              value={format(scheduledDate, 'yyyy-MM-dd')}
              onChange={(e) => setScheduledDate(new Date(e.target.value + 'T00:00:00'))} // Ensure time is considered for timezone consistency
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full"
            />
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleAssignWorkout} 
              disabled={loading || !selectedUserId || !selectedWorkoutId}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? 'Assigning...' : 'Assign Workout'}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
