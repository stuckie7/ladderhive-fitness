
import React from 'react';
import { Activity } from "lucide-react";
import MetricsCard from "@/components/dashboard/MetricsCard";
import WorkoutHistory from "@/components/dashboard/WorkoutHistory";

interface DashboardMetricsSectionProps {
  metricsData: Array<{
    name: string;
    value: number;
    unit?: string;
    change?: number;
  }>;
  weeklyChartData: any[];
  recentWorkouts: any[];
  isLoading: boolean;
  onSelectDate: (date: Date) => void;
  onSelectWorkout: (id: string) => void;
}

const DashboardMetricsSection: React.FC<DashboardMetricsSectionProps> = ({
  metricsData,
  weeklyChartData,
  recentWorkouts,
  isLoading,
  onSelectDate,
  onSelectWorkout
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[calc(100vh-12rem)]">
      <div className="col-span-2 md:col-span-1">
        <MetricsCard 
          title="Workout Metrics" 
          icon={<Activity className="h-5 w-5" />}
          metrics={metricsData} 
          chartData={weeklyChartData}
          isLoading={isLoading} 
        />
      </div>
      <div className="col-span-1">
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
