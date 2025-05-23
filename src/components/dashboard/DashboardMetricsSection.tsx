
import React from 'react';
import { Activity } from "lucide-react";
import MetricsCard from "@/components/dashboard/MetricsCard";
import WorkoutHistory from "@/components/dashboard/WorkoutHistory";
import { useMetrics } from "@/hooks/use-metrics";

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
  const { metrics } = useMetrics();
  return (
    <div className="flex flex-col gap-6">
      <div className="w-full">
        <MetricsCard 
          title="Workout Metrics" 
          icon={<Activity className="h-5 w-5" />}
          metrics={metrics} 
          chartData={weeklyChartData}
          isLoading={isLoading} 
        />
      </div>
      <div className="w-full">
        <WorkoutHistory 
          workouts={recentWorkouts}
          isLoading={isLoading}
          onSelectDate={onSelectDate}
          onSelectWorkout={onSelectWorkout}
        />
      </div>
    </div>
  );
};

export default DashboardMetricsSection;
