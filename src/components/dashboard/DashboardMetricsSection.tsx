
import React from 'react';
import { Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import WorkoutHistory from "@/components/dashboard/WorkoutHistory";
import { useMetrics } from "@/hooks/use-metrics";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardMetricsSectionProps {
  weeklyChartData: any[];
  recentWorkouts: any[];
  isLoading: boolean;
  onSelectDate: (date: Date) => void;
  onSelectWorkout: (id: string) => void;
}

const DashboardMetricsSection: React.FC<DashboardMetricsSectionProps> = ({
  weeklyChartData,
  recentWorkouts,
  isLoading,
  onSelectDate,
  onSelectWorkout
}) => {
  const { metrics, isLoading: metricsLoading } = useMetrics();
  
  // Group metrics by category for better organization
  const progressMetrics = metrics.filter(metric => 
    ['Current Streak', 'Completion Rate', 'Weekly Workouts', 'Monthly Workouts'].includes(metric.name)
  );
  
  const activityMetrics = metrics.filter(metric => 
    !['Current Streak', 'Completion Rate', 'Weekly Workouts', 'Monthly Workouts'].includes(metric.name)
  );

  if (metricsLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-fitness-primary" />
            <h2 className="text-xl font-semibold text-white">Your Progress</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
          
          <Skeleton className="h-64 w-full" />
        </div>
        
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress Section */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800/50">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-5 w-5 text-fitness-primary" />
          <h2 className="text-xl font-semibold text-white">Your Progress</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {progressMetrics.map((metric) => (
            <div 
              key={metric.name}
              className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50 hover:border-fitness-primary/30 transition-colors"
            >
              <div className="text-sm text-gray-400 mb-1">{metric.name}</div>
              <div className="text-2xl font-bold text-white">
                {metric.name === 'Completion Rate' ? `${metric.value}%` : metric.value}
                {metric.unit && metric.name !== 'Completion Rate' && (
                  <span className="text-sm ml-1 text-gray-400">{metric.unit}</span>
                )}
              </div>
              {metric.change !== undefined && (
                <div className={`text-xs mt-1 ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}% from last period
                </div>
              )}
            </div>
          ))}
        </div>
        
        {weeklyChartData && weeklyChartData.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Weekly Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="workouts" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      
      {/* Activity Summary */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
        <h3 className="text-lg font-semibold text-white mb-4">Activity Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activityMetrics.map((metric) => (
            <div 
              key={metric.name}
              className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50"
            >
              <div className="text-xs text-gray-400">{metric.name}</div>
              <div className="text-lg font-semibold text-white">
                {metric.value}
                {metric.unit && <span className="text-xs ml-1 text-gray-400">{metric.unit}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardMetricsSection;
