
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ChevronUp, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface MetricData {
  name: string;
  value: number;
  change?: number;
  unit?: string;
}

interface MetricsCardProps {
  title: string;
  icon?: JSX.Element;
  metrics: MetricData[];
  chartData?: any[];
  isLoading?: boolean;
}

const MetricsCard = ({ 
  title, 
  icon = <Activity className="h-5 w-5" />, 
  metrics, 
  chartData,
  isLoading = false 
}: MetricsCardProps) => {
  // Updated title display to use the + symbol in a different color
  const renderTitle = () => {
    if (title === "Workout Metrics") {
      return (
        <span>
          Workout Metrics<span className="text-fitness-secondary">+</span>
        </span>
      );
    }
    return title;
  };

  return (
    <Card className="glass-panel h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2 text-fitness-primary">
          {icon}
          {renderTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-fitness-primary">Progress Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.filter(metric => 
                  ['Current Streak', 'Completion Rate', 'Weekly Workouts', 'Monthly Workouts'].includes(metric.name)
                ).map((metric) => (
                  <div 
                    key={metric.name} 
                    className="bg-gray-900/40 p-4 rounded-lg border border-gray-800/50 hover:border-fitness-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">{metric.name}</div>
                      {metric.change !== undefined && (
                        <div className={`text-xs px-2 py-0.5 rounded-full ${metric.change >= 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                          {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                        </div>
                      )}
                    </div>
                    <div className="text-2xl font-bold mt-1 text-white">
                      {metric.name === 'Completion Rate' ? `${metric.value}%` : metric.value}
                      {metric.unit && metric.name !== 'Completion Rate' && (
                        <span className="text-sm ml-1 text-gray-400">{metric.unit}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-fitness-primary mb-4">Activity Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {metrics.filter(metric => 
                    !['Current Streak', 'Completion Rate', 'Weekly Workouts', 'Monthly Workouts'].includes(metric.name)
                  ).map((metric) => (
                    <div 
                      key={metric.name} 
                      className="bg-gray-900/40 p-3 rounded-lg border border-gray-800/50 hover:border-fitness-primary/30 transition-colors"
                    >
                      <div className="text-xs text-gray-400">{metric.name}</div>
                      <div className="text-lg font-semibold mt-1">
                        {metric.value}
                        {metric.unit && <span className="text-xs ml-1 text-gray-400">{metric.unit}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {chartData && chartData.length > 0 && (
              <div className="h-48 mt-4">
                <ChartContainer 
                  config={{
                    weight: { theme: { light: "#3b82f6", dark: "#60a5fa" } },
                    minutes: { theme: { light: "#10b981", dark: "#34d399" } },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <XAxis 
                        dataKey="name" 
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        yAxisId="left"
                        orientation="left"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value}`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{ fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar
                        name="Minutes"
                        dataKey="minutes"
                        yAxisId="left"
                        fill="var(--color-minutes)"
                        radius={[4, 4, 0, 0]}
                        barSize={6}
                      />
                      <Bar
                        name="Weight (lbs)"
                        dataKey="weight"
                        yAxisId="right"
                        fill="var(--color-weight)"
                        radius={[4, 4, 0, 0]}
                        barSize={6}
                      />
                      <ChartTooltip 
                        cursor={{ fill: '#ffffff10' }}
                        content={<ChartTooltipContent />}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
