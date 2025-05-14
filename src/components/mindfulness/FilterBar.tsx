
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock, Brain, Feather } from "lucide-react";
import { TimeFilter, IntensityFilter, StressTypeFilter } from "@/hooks/use-mindful-movement";

interface FilterBarProps {
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  intensityFilter: IntensityFilter;
  setIntensityFilter: (filter: IntensityFilter) => void;
  stressTypeFilter: StressTypeFilter;
  setStressTypeFilter: (filter: StressTypeFilter) => void;
}

export const FilterBar = ({
  timeFilter,
  setTimeFilter,
  intensityFilter,
  setIntensityFilter,
  stressTypeFilter,
  setStressTypeFilter,
}: FilterBarProps) => {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Time Available</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={timeFilter === "quick" ? "default" : "outline"}
            size="sm"
            className={timeFilter === "quick" ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setTimeFilter(timeFilter === "quick" ? null : "quick")}
          >
            5-Min Quick Relief
          </Button>
          <Button
            variant={timeFilter === "short" ? "default" : "outline"}
            size="sm"
            className={timeFilter === "short" ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setTimeFilter(timeFilter === "short" ? null : "short")}
          >
            15-Min Sessions
          </Button>
          <Button
            variant={timeFilter === "long" ? "default" : "outline"}
            size="sm"
            className={timeFilter === "long" ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setTimeFilter(timeFilter === "long" ? null : "long")}
          >
            30-Min Flows
          </Button>
        </div>
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Stress Type</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={stressTypeFilter === "work" ? "default" : "outline"}
            size="sm"
            className={stressTypeFilter === "work" ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setStressTypeFilter(stressTypeFilter === "work" ? null : "work")}
          >
            Work Anxiety
          </Button>
          <Button
            variant={stressTypeFilter === "sleep" ? "default" : "outline"}
            size="sm"
            className={stressTypeFilter === "sleep" ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setStressTypeFilter(stressTypeFilter === "sleep" ? null : "sleep")}
          >
            Sleep Prep
          </Button>
          <Button
            variant={stressTypeFilter === "refresh" ? "default" : "outline"}
            size="sm"
            className={stressTypeFilter === "refresh" ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setStressTypeFilter(stressTypeFilter === "refresh" ? null : "refresh")}
          >
            Midday Refresh
          </Button>
        </div>
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Feather className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Intensity</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={intensityFilter === "gentle" ? "default" : "outline"}
            size="sm"
            className={intensityFilter === "gentle" ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setIntensityFilter(intensityFilter === "gentle" ? null : "gentle")}
          >
            Gentle
          </Button>
          <Button
            variant={intensityFilter === "moderate" ? "default" : "outline"}
            size="sm"
            className={intensityFilter === "moderate" ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setIntensityFilter(intensityFilter === "moderate" ? null : "moderate")}
          >
            Moderate
          </Button>
          <Button
            variant={intensityFilter === "restorative" ? "default" : "outline"}
            size="sm"
            className={intensityFilter === "restorative" ? "bg-blue-600 hover:bg-blue-700" : ""}
            onClick={() => setIntensityFilter(intensityFilter === "restorative" ? null : "restorative")}
          >
            Restorative
          </Button>
        </div>
      </div>
      
      {(timeFilter || intensityFilter || stressTypeFilter) && (
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 dark:text-blue-400"
          onClick={() => {
            setTimeFilter(null);
            setIntensityFilter(null);
            setStressTypeFilter(null);
          }}
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
};
