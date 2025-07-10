
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ScheduledWorkout {
  id: string;
  user_id: string;
  workout_id: string;
  scheduled_date: string;
  status: string;
  admin_message: string | null;
  created_at: string;
  scheduled_by_admin: string | null;
  prepared_workouts: {
    id: string;
    title: string;
    difficulty: string;
    duration_minutes: number;
    description?: string;
    thumbnail_url?: string;
  } | null;
}

interface ScheduledWorkoutCardProps {
  scheduledWorkout: ScheduledWorkout;
  onStatusUpdate?: () => void;
}

export function ScheduledWorkoutCard({ scheduledWorkout, onStatusUpdate }: ScheduledWorkoutCardProps) {
  const { toast } = useToast();

  const updateStatus = async (newStatus: 'completed' | 'skipped') => {
    try {
      const { error } = await supabase
        .from('scheduled_workouts')
        .update({ status: newStatus })
        .eq('id', scheduledWorkout.id);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Workout marked as ${newStatus}`,
      });

      onStatusUpdate?.();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update workout status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'skipped': return 'destructive';
      case 'scheduled': return 'outline';
      default: return 'outline';
    }
  };

  const workout = scheduledWorkout.prepared_workouts;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-2">
              {workout?.title || 'Workout'}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(scheduledWorkout.scheduled_date), 'MMM d, yyyy')}
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant(scheduledWorkout.status)}>
            {scheduledWorkout.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {workout && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{workout.duration_minutes} minutes</span>
              <Badge variant="outline">{workout.difficulty}</Badge>
            </div>
            
            {workout.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {workout.description}
              </p>
            )}
          </div>
        )}

        {scheduledWorkout.admin_message && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Admin Message</p>
                <p className="text-sm text-blue-700">{scheduledWorkout.admin_message}</p>
              </div>
            </div>
          </div>
        )}

        {scheduledWorkout.scheduled_by_admin && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>Scheduled by admin</span>
          </div>
        )}

        {scheduledWorkout.status === 'scheduled' && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => updateStatus('completed')}
              className="flex-1"
            >
              Mark Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus('skipped')}
              className="flex-1"
            >
              Skip
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
