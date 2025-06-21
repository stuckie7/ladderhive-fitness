import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, HeartPulse, Zap, Loader2, AlertCircle, Moon, Target, Flame, Footprints, Dumbbell, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useFitbitData } from '@/hooks/use-fitbit-data';
import { supabase } from '@/lib/supabase';

const StatCard = ({ title, value, icon, goal, progress }: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  goal?: number;
  progress?: number;
}) => (
  <Card className="bg-slate-800/50 border-slate-800">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base text-slate-300">{title}</p>
          <p className="text-4xl font-bold text-slate-100">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-sky-500/20 text-sky-500">
          {icon}
        </div>
      </div>
      {goal !== undefined && progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1 text-slate-300">
            <span>Progress</span>
            <span className="font-semibold text-slate-200">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

interface HealthIntegrationProps {
  initialStepGoal?: number;
}

const HealthIntegration: React.FC<HealthIntegrationProps> = ({ initialStepGoal = 10000 }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isLoading, error, isConnected, stats = {}, connectFitbit, disconnectFitbit, fetchHealthData } = useFitbitData();
  
  const [isSaving, setIsSaving] = useState(false);
  const [stepGoal, setStepGoal] = useState(initialStepGoal);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (initialStepGoal) {
        setStepGoal(initialStepGoal);
    }
  }, [initialStepGoal]);

  useEffect(() => {
    if (isConnected) {
      fetchHealthData();
    }
  }, [isConnected]);

  const handleSaveGoal = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save a goal.", variant: "destructive" });
      return;
    }
    if (!stepGoal || stepGoal <= 0) {
      toast({ title: "Invalid Goal", description: "Please enter a valid step goal.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ daily_step_goal: stepGoal })
        .eq('id', user.id);

      if (error) throw error;

      toast({ title: "Success", description: "Your step goal has been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save step goal.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const displayStats = {
    ...stats,
    goal: stepGoal,
    progress: stats.steps && stepGoal > 0 ? (stats.steps / stepGoal) * 100 : 0,
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-slate-100">Health Stats</CardTitle>
              <CardDescription className="text-slate-400">
                {displayStats.lastSynced
                  ? `Last synced ${formatDistanceToNow(new Date(displayStats.lastSynced), { addSuffix: true })}`
                  : 'Connect your Fitbit to sync health data'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isConnected && (
                <Button onClick={fetchHealthData} disabled={isLoading} variant="outline" size="sm" className="text-slate-300 hover:text-slate-100 border-slate-600 hover:border-slate-500 hover:bg-slate-700/50">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  {isLoading ? 'Syncing...' : 'Refresh'}
                </Button>
              )}
              {isConnected && (
                <Button onClick={disconnectFitbit} disabled={isLoading} variant="destructive" size="sm">
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!user?.id ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Please log in to connect your Fitbit account.</span>
            </div>
          ) : !isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Connect your Fitbit account to track your health metrics automatically.</span>
              </div>
              <Button onClick={connectFitbit} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
                {isLoading ? 'Connecting...' : 'Connect Fitbit'}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Steps" value={displayStats.steps != null ? displayStats.steps.toLocaleString() : '--'} icon={<Activity className="h-6 w-6" />} goal={displayStats.goal} progress={displayStats.progress || 0} />
                <StatCard title="Calories" value={displayStats.calories != null ? displayStats.calories.toLocaleString() : '--'} icon={<Flame className="h-6 w-6" />} />
                <StatCard title="Active Minutes" value={displayStats.activeMinutes != null ? displayStats.activeMinutes.toString() : '--'} icon={<Zap className="h-6 w-6" />} />
                <StatCard title="Sleep" value={displayStats.sleepDuration ? `${(displayStats.sleepDuration / 60).toFixed(1)}h` : '--'} icon={<Moon className="h-6 w-6" />} />
              </div>

              {showMore && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                  <StatCard title="Distance" value={displayStats.distance ? `${displayStats.distance.toFixed(2)} mi` : '--'} icon={<Footprints className="h-6 w-6" />} />
                  <StatCard title="Heart Rate" value={displayStats.heartRate || '--'} icon={<HeartPulse className="h-6 w-6" />} />
                  <StatCard title="Workouts" value={displayStats.workouts != null ? displayStats.workouts.toString() : '--'} icon={<Dumbbell className="h-6 w-6" />} />
                </div>
              )}

              <div className="mt-4">
                <Button onClick={() => setShowMore(!showMore)} variant="outline" className="w-full text-slate-300 hover:text-slate-100 border-slate-600 hover:border-slate-500 hover:bg-slate-700/50">
                  {showMore ? 'Show Less' : 'Show More Stats'}
                </Button>
              </div>
            </>
          )}
          
          {error && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Target className="h-5 w-5" />
              Your Daily Goal
            </CardTitle>
            <CardDescription className="text-slate-400">Set a daily step goal to personalize your progress tracking.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-end gap-4">
            <div className="grid flex-grow items-center gap-1.5">
              <Label htmlFor="step-goal" className="text-slate-400">Steps</Label>
              <Input
                id="step-goal"
                type="number"
                value={stepGoal}
                onChange={(e) => setStepGoal(Number(e.target.value))}
                className="text-base border-slate-700 placeholder:text-slate-300 text-sky-400 font-bold"
                placeholder="e.g., 10000"
                disabled={isSaving}
              />
            </div>
            <Button onClick={handleSaveGoal} disabled={isSaving} className="btn-fitness-primary w-full md:w-auto text-white">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HealthIntegration;
