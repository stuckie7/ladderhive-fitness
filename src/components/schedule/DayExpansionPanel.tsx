
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Play } from 'lucide-react';
import { VideoThumbnail } from '@/components/common/VideoThumbnail';

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
    video_url?: string;
  } | null;
}

interface DayExpansionPanelProps {
  date: Date;
  workouts: ScheduledWorkout[];
  onClose: () => void;
  onStatusUpdate: (workoutId: string, status: 'completed' | 'skipped') => void;
  onStartWorkout: (workout: ScheduledWorkout) => void;
}

export function DayExpansionPanel({ 
  date, 
  workouts, 
  onClose, 
  onStatusUpdate, 
  onStartWorkout 
}: DayExpansionPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'skipped': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mt-4 border-2 border-accent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Workouts for {format(date, 'EEEE, MMMM d')}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workouts.map(workout => {
            const workoutData = workout.prepared_workouts;
            if (!workoutData) return null;
            
            return (
              <Card key={workout.id} className="overflow-hidden">
                <div className="relative">
                  {workoutData.thumbnail_url && workoutData.video_url ? (
                    <VideoThumbnail
                      thumbnailUrl={workoutData.thumbnail_url}
                      videoUrl={workoutData.video_url}
                      title={workoutData.title}
                      className="w-full h-48"
                      size="lg"
                    />
                  ) : workoutData.thumbnail_url ? (
                    <div className="relative w-full h-48">
                      <img 
                        src={workoutData.thumbnail_url} 
                        alt={workoutData.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <Play className="h-12 w-12 text-white opacity-80" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <Play className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(workout.status)}>
                      {workout.status}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {workoutData.title}
                      </h3>
                      {workoutData.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {workoutData.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">
                        {workoutData.duration_minutes} min
                      </Badge>
                      <Badge className={getDifficultyColor(workoutData.difficulty)}>
                        {workoutData.difficulty}
                      </Badge>
                    </div>
                    
                    {workout.admin_message && (
                      <div className="bg-blue-50 p-2 rounded text-sm">
                        <p className="text-blue-900">{workout.admin_message}</p>
                      </div>
                    )}
                    
                    {workout.status === 'scheduled' ? (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => onStartWorkout(workout)}
                          className="flex-1"
                        >
                          Start Workout
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onStatusUpdate(workout.id, 'completed')}
                          className="flex-1"
                        >
                          Mark Complete
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onStatusUpdate(workout.id, 'skipped')}
                          className="px-3"
                        >
                          Skip
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <Badge className={getStatusColor(workout.status)}>
                          {workout.status === 'completed' ? 'Completed' : 'Skipped'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
