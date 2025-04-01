
import { useState, useEffect } from 'react';
import { useWeeklyData } from './use-weekly-data';
import { useMonthlySummary } from './use-monthly-summary';
import { ActivityData, MonthlySummary } from '@/types/activity';

export interface ActivityProgressResult {
  weeklyData: ActivityData[];
  monthlySummary: MonthlySummary | null;
  isLoading: boolean;
  refreshData: () => void;
}

export const useActivityProgress = (): ActivityProgressResult => {
  const { weeklyData, isLoading: isWeeklyLoading, refreshData: refreshWeeklyData } = useWeeklyData();
  const { monthlySummary, isLoading: isMonthlyLoading, refreshData: refreshMonthlySummary } = useMonthlySummary();
  
  const isLoading = isWeeklyLoading || isMonthlyLoading;
  
  const refreshData = () => {
    refreshWeeklyData();
    refreshMonthlySummary();
  };
  
  return {
    weeklyData,
    monthlySummary,
    isLoading,
    refreshData
  };
};

// Re-export types from the types file for backward compatibility
export { ActivityData, MonthlySummary } from '@/types/activity';
