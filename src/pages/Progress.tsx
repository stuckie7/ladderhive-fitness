
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useDailyProgress } from "@/hooks/use-daily-progress";
import { useActivityProgress } from "@/hooks/use-activity-progress";
import DailyProgressCard from "@/components/progress/DailyProgressCard";
import WeeklyActivity from "@/components/progress/WeeklyActivity";
import MonthlyActivity from "@/components/progress/MonthlyActivity";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, TrendingUp, ChartBar } from "lucide-react";
import { DynamicBreadcrumb } from "@/components/ui/dynamic-breadcrumb";

const ProgressPage = () => {
  const { progress, isLoading: isDailyLoading } = useDailyProgress();
  const { weeklyData, monthlySummary, isLoading: isActivityLoading } = useActivityProgress();
  const [activeTab, setActiveTab] = useState("daily");
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <DynamicBreadcrumb className="mb-4" />
        
        <div className="max-w-5xl mx-auto space-y-6">
          <Tabs 
            defaultValue="daily" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="daily" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Daily</span>
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Weekly</span>
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex items-center gap-2">
                <ChartBar className="h-4 w-4" />
                <span>Monthly</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="space-y-6 animate-in fade-in">
              <DailyProgressCard progress={progress} isLoading={isDailyLoading} />
            </TabsContent>
            
            <TabsContent value="weekly" className="space-y-6 animate-in fade-in">
              <WeeklyActivity 
                weeklyData={weeklyData} 
                isLoading={isActivityLoading} 
              />
            </TabsContent>
            
            <TabsContent value="monthly" className="space-y-6 animate-in fade-in">
              <MonthlyActivity 
                monthlySummary={monthlySummary} 
                isLoading={isActivityLoading} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProgressPage;
