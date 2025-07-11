
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { CalendarDays, Clock, CheckCircle, XCircle, Loader2, Dumbbell, RefreshCw, Download } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';

interface ScheduledWorkout {
  id: string;
  scheduled_date: string;
  status: 'scheduled' | 'completed' | 'skipped';
  suggested_workouts: Array<{
    id: string;
    name: string;
    description: string | null;
    difficulty: string;
    duration: number;
    category: string;
    target_muscles: string[] | null;
    image_url: string | null;
  }> | null;
}

export default function MyWorkoutsPage() {
  const [workouts, setWorkouts] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchWorkouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to view your workouts.');
        setWorkouts([]);
        return;
      }

      const { data, error: dbError } = await supabase
        .from('scheduled_workouts')
        .select(`
          id,
          scheduled_date,
          status,
          suggested_workouts (
            id,
            name,
            description,
            difficulty,
            duration,
            category,
            target_muscles,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (dbError) throw dbError;

      setWorkouts(data || []);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError((err as Error).message || 'Failed to load your workouts.');
      toast({
        title: 'Error Loading Workouts',
        description: (err as Error).message || 'Could not retrieve your scheduled workouts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const handleUpdateWorkoutStatus = async (workoutScheduleId: string, newStatus: 'completed' | 'skipped') => {
    try {
      const { error } = await supabase
        .from('scheduled_workouts')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', workoutScheduleId);

      if (error) throw error;

      toast({
        title: 'Workout Updated!',
        description: `Workout marked as ${newStatus}.`,
      });
      fetchWorkouts();
    } catch (err) {
      console.error(`Error updating workout to ${newStatus}:`, err);
      toast({
        title: 'Update Failed',
        description: (err as Error).message || `Could not mark workout as ${newStatus}.`,
        variant: 'destructive',
      });
    }
  };

  const handleWorkoutClick = (workoutId: string) => {
    navigate(`/workouts/${workoutId}`);
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to export data.',
          variant: 'destructive',
        });
        return;
      }

      // Fetch all scheduled workouts for CSV export
      const { data: allWorkouts, error } = await supabase
        .from('scheduled_workouts')
        .select(`
          id,
          user_id,
          scheduled_date,
          status,
          created_at,
          suggested_workouts (
            id,
            name,
            description,
            difficulty,
            duration,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      // Create CSV content
      const csvHeaders = [
        'User ID',
        'Workout Schedule ID',
        'Workout ID',
        'Workout Name',
        'Category',
        'Difficulty',
        'Duration (min)',
        'Scheduled Date',
        'Status',
        'Created At'
      ];

      const csvRows = allWorkouts?.map(workout => [
        workout.user_id,
        workout.id,
        workout.suggested_workouts?.[0]?.id || '',
        workout.suggested_workouts?.[0]?.name || '',
        workout.suggested_workouts?.[0]?.category || '',
        workout.suggested_workouts?.[0]?.difficulty || '',
        workout.suggested_workouts?.[0]?.duration || '',
        format(new Date(workout.scheduled_date), 'yyyy-MM-dd'),
        workout.status,
        format(new Date(workout.created_at), 'yyyy-MM-dd HH:mm:ss')
      ]) || [];

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `my-workouts-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Successful',
        description: 'Your workout data has been exported to CSV.',
      });
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      toast({
        title: 'Export Failed',
        description: 'Could not export workout data.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading your workouts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 py-12 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchWorkouts} className="mt-6">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 sm:mb-0">My Scheduled Workouts</h1>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm" disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </Button>
          <Button onClick={fetchWorkouts} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </header>

      {workouts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <Dumbbell className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Workouts Scheduled</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            It looks like you don't have any workouts scheduled right now.
          </p>
          <Button onClick={() => navigate('/suggested-workouts')}>
            Explore Workouts
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {workouts.map((schedule) => {
            const workout = schedule.suggested_workouts?.[0];
            if (!workout) return null;

            return (
              <Card 
                key={schedule.id} 
                className={`flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer ${
                  schedule.status === 'completed' 
                    ? 'bg-green-50 dark:bg-green-900/30' 
                    : schedule.status === 'skipped' 
                    ? 'bg-red-50 dark:bg-red-900/30' 
                    : 'bg-white dark:bg-gray-800'
                }`}
                onClick={() => handleWorkoutClick(workout.id)}
              >
                {workout.image_url && (
                  <img
                    src={workout.image_url}
                    alt={workout.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-1">
                    <CardTitle className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
                      {workout.name}
                    </CardTitle>
                    <Badge 
                      variant={
                        schedule.status === 'completed' 
                          ? 'default' 
                          : schedule.status === 'skipped' 
                          ? 'destructive' 
                          : 'outline'
                      } 
                      className="capitalize"
                    >
                      {schedule.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground space-x-3">
                    <span className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-1.5" />
                      {format(new Date(schedule.scheduled_date), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5" />
                      {workout.duration} min
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    Difficulty: {workout.difficulty} | Category: {workout.category}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow mb-2">
                  {workout.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {workout.description}
                    </p>
                  )}
                  {workout.target_muscles && workout.target_muscles.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Target Muscles</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {workout.target_muscles.map((muscle) => (
                          <Badge key={muscle} variant="secondary" className="capitalize text-xs">
                            {muscle}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0 border-t dark:border-gray-700 pt-4">
                  {schedule.status === 'scheduled' && (
                    <div className="flex w-full gap-3" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => handleUpdateWorkoutStatus(schedule.id, 'completed')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete
                      </Button>
                      <Button
                        onClick={() => handleUpdateWorkoutStatus(schedule.id, 'skipped')}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Skip
                      </Button>
                    </div>
                  )}
                  {(schedule.status === 'completed' || schedule.status === 'skipped') && (
                     <p className="text-sm text-center w-full text-muted-foreground">
                       Workout {schedule.status} on {format(new Date(schedule.scheduled_date), 'MMM d, yyyy')}
                     </p>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
