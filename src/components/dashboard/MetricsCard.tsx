
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {metrics.map((metric) => (
                <div 
                  key={metric.name} 
                  className="bg-gray-900/40 p-3 rounded-lg border border-gray-800/50"
                >
                  <div className="text-xs text-gray-400">{metric.name}</div>
                  <div className="text-xl font-semibold mt-1">
                    {metric.value}
                    {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
                  </div>
                  {metric.change !== undefined && (
                    <div className={`text-xs mt-1 flex items-center ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <ChevronUp className={`h-3 w-3 ${metric.change < 0 ? 'rotate-180' : ''}`} />
                      <span>{Math.abs(metric.change)}%</span>
                    </div>
                  )}
                </div>
              ))}
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
