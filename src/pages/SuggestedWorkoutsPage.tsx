import { useState } from 'react';
import { useSuggestedWorkouts } from '@/hooks/useSuggestedWorkouts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Clock, Activity, Dumbbell, HeartPulse, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export default function SuggestedWorkoutsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [duration, setDuration] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get suggested workouts with a higher limit since we'll filter them
  const { suggestedWorkouts, loading, error, scheduleWorkout, refresh } = useSuggestedWorkouts(50);
  const [scheduling, setScheduling] = useState<Record<string, boolean>>({});
  const [selectedDates, setSelectedDates] = useState<Record<string, Date | undefined>>({});

  // Filter workouts based on search and filters
  const filteredWorkouts = suggestedWorkouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        workout.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficulty === 'all' || workout.difficulty === difficulty;
    const matchesDuration = duration === 'all' || 
      (duration === 'short' && workout.duration <= 20) ||
      (duration === 'medium' && workout.duration > 20 && workout.duration <= 40) ||
      (duration === 'long' && workout.duration > 40);
    const matchesCategory = category === 'all' || 
      (workout.category && workout.category.toLowerCase() === category.toLowerCase());

    return matchesSearch && matchesDifficulty && matchesDuration && matchesCategory;
  });

  // Group by category for the tabbed interface
  const workoutsByCategory = filteredWorkouts.reduce((acc, workout) => {
    const cat = workout.category || 'Other';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(workout);
    return acc;
  }, {} as Record<string, typeof filteredWorkouts>);

  const handleSchedule = async (workoutId: string) => {
    const date = selectedDates[workoutId];
    if (!date) {
      toast({
        title: 'Select a date',
        description: 'Please select a date to schedule this workout.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setScheduling(prev => ({ ...prev, [workoutId]: true }));
      await scheduleWorkout(workoutId, date.toISOString());
      
      toast({
        title: 'Workout scheduled!',
        description: 'Your workout has been added to your schedule.',
      });
      
      // Clear the selected date
      setSelectedDates(prev => ({ ...prev, [workoutId]: undefined }));
    } catch (error) {
      console.error('Error scheduling workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule workout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setScheduling(prev => ({ ...prev, [workoutId]: false }));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cardio':
        return <Activity className="h-4 w-4 mr-2" />;
      case 'strength':
        return <Dumbbell className="h-4 w-4 mr-2" />;
      case 'hiit':
        return <Sparkles className="h-4 w-4 mr-2" />;
      case 'yoga':
      case 'pilates':
        return <Sparkles className="h-4 w-4 mr-2" />; // Replaced Yoga with Sparkles
      default:
        return <HeartPulse className="h-4 w-4 mr-2" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">We couldn't load the suggested workouts.</p>
        <Button onClick={refresh}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Suggested Workouts</h1>
        <p className="text-muted-foreground">
          Discover personalized workout recommendations based on your fitness level and goals.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search workouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Duration</SelectItem>
                <SelectItem value="short">Short (&lt;20 min)</SelectItem>
                <SelectItem value="medium">Medium (20-40 min)</SelectItem>
                <SelectItem value="long">Long (40+ min)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="hiit">HIIT</SelectItem>
                <SelectItem value="yoga">Yoga</SelectItem>
                <SelectItem value="pilates">Pilates</SelectItem>
                <SelectItem value="mobility">Mobility</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Workouts Grid */}
      {Object.keys(workoutsByCategory).length > 0 ? (
        <Tabs defaultValue={Object.keys(workoutsByCategory)[0]} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            {Object.keys(workoutsByCategory).map((cat) => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {getCategoryIcon(cat)}
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(workoutsByCategory).map(([category, workouts]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workouts.map((workout) => (
                  <Card key={workout.id} className="flex flex-col h-full">
                    {workout.image_url && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={workout.image_url}
                          alt={workout.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{workout.name}</CardTitle>
                          <div className="flex items-center mt-1 space-x-2 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {workout.duration} min
                            </span>
                            <span className="capitalize">• {workout.difficulty}</span>
                          </div>
                        </div>
                        {workout.target_muscles && workout.target_muscles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {workout.target_muscles.slice(0, 3).map((muscle) => (
                              <span 
                                key={muscle} 
                                className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground"
                              >
                                {muscle}
                              </span>
                            ))}
                            {workout.target_muscles.length > 3 && (
                              <span className="text-xs text-muted-foreground self-center">
                                +{workout.target_muscles.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {workout.description || 'No description available.'}
                      </p>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3">
                      <div className="w-full">
                        <div className="flex items-center space-x-2">
                          <div className="relative w-full">
                            <div className="w-full">
                              <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={selectedDates[workout.id] ? (selectedDates[workout.id] as Date).toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const date = e.target.value ? new Date(e.target.value) : undefined;
                                  setSelectedDates(prev => ({ ...prev, [workout.id]: date }));
                                }}
                                className="w-full p-2 border rounded-md"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleSchedule(workout.id)}
                        disabled={!selectedDates[workout.id] || scheduling[workout.id]}
                        className="w-full"
                      >
                        {scheduling[workout.id] ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Scheduling...
                          </>
                        ) : (
                          'Schedule Workout'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No workouts found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your filters or check back later for new recommendations.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setDifficulty('all');
              setDuration('all');
              setCategory('all');
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
