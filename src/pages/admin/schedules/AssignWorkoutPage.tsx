import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminService } from '@/services/adminService';
import { AdminUser, AdminWorkout } from '@/types/admin';

// Extend the base types with required fields
interface User extends AdminUser {
  id: string;
  email: string;
  full_name: string | null;
}

interface Workout extends AdminWorkout {
  id: string;
  name: string;
  duration_minutes?: number;
  description?: string | null;
}

export function AssignWorkoutPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [workouts, setWorkoutTemplates] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    workoutId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch users and workout templates in parallel
        const [usersData, workoutsData] = await Promise.all([
          adminService.getUsers(),
          adminService.getWorkouts(),
        ]);
        
        // Transform the data to match our types
        const formattedUsers = usersData.map(user => ({
          id: user.id,
          email: user.email || '',
          full_name: user.full_name || 'Unknown User',
          role: user.role || 'user',
        }));
        
        const formattedWorkouts = (workoutsData || []).map(workout => ({
          id: workout.id,
          name: workout.name,
          duration_minutes: workout.duration_minutes || 30, // Default to 30 minutes if not specified
          description: workout.description || null,
        }));
        
        setUsers(formattedUsers);
        setWorkoutTemplates(formattedWorkouts);
        
        // Set default values if users and workouts are available
        if (formattedUsers.length > 0 && formattedWorkouts.length > 0) {
          setFormData(prev => ({
            ...prev,
            userId: formattedUsers[0].id,
            workoutId: formattedWorkouts[0].id,
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load required data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Define the schedule data type that matches the admin service
  type ScheduleData = {
    userId: string;
    workoutId: string;
    scheduledDate: string;
    notes?: string;
    createdBy: string;
  };

  // Schedule a workout for a user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.workoutId || !formData.scheduledDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      // Get the current user ID for the createdBy field
      const currentUser = await adminService.getCurrentUser();
      
      // Prepare the schedule data
      const scheduleData: ScheduleData = {
        userId: formData.userId,
        workoutId: formData.workoutId,
        scheduledDate: formData.scheduledDate,
        notes: formData.notes || '',
        createdBy: currentUser.id,
      };
      
      // Create the scheduled workout
      await adminService.scheduleWorkout(scheduleData);
      
      toast({
        title: 'Success',
        description: 'Workout scheduled successfully',
      });
      
      // Redirect to schedules page after a short delay
      setTimeout(() => {
        navigate('/admin/schedules');
      }, 1000);
      
    } catch (error) {
      console.error('Error scheduling workout:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to schedule workout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Assign Workout Schedule</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="user">Select User</Label>
            <Select
              value={formData.userId}
              onValueChange={(value) => setFormData({ ...formData, userId: value })}
              disabled={loading || users.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? 'Loading users...' : 'Select a user'} />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email || `User ${user.id.substring(0, 6)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workout">Select Workout</Label>
            <Select
              value={formData.workoutId}
              onValueChange={(value) => setFormData({ ...formData, workoutId: value })}
              disabled={loading || workouts.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? 'Loading workouts...' : 'Select a workout'} />
              </SelectTrigger>
              <SelectContent>
                {workouts.map((workout) => {
                  const duration = workout.duration_minutes || 30; // Default to 30 minutes if not specified
                  return (
                    <SelectItem key={workout.id} value={workout.id}>
                      {workout.name} ({duration} min)
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Scheduled Date</Label>
            <Input
              id="scheduledDate"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Add any notes or instructions for this scheduled workout..."
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/schedules')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || users.length === 0 || workouts.length === 0}>
              {loading ? 'Scheduling...' : 'Schedule Workout'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
