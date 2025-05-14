
import React from "react";
import { Badge } from "@/components/ui/badge";
import { TimeFilter, IntensityFilter, StressTypeFilter } from "@/hooks/use-mindful-movement";
import { Separator } from "@/components/ui/separator";

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
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Time Available</h3>
        <div className="flex flex-wrap gap-2">
          <FilterBadge 
            label="Quick (5-10 min)" 
            active={timeFilter === "quick"} 
            onClick={() => setTimeFilter(timeFilter === "quick" ? null : "quick")}
          />
          <FilterBadge 
            label="Short (10-20 min)" 
            active={timeFilter === "short"} 
            onClick={() => setTimeFilter(timeFilter === "short" ? null : "short")}
          />
          <FilterBadge 
            label="Long (20+ min)" 
            active={timeFilter === "long"} 
            onClick={() => setTimeFilter(timeFilter === "long" ? null : "long")}
          />
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Intensity Level</h3>
        <div className="flex flex-wrap gap-2">
          <FilterBadge 
            label="Gentle" 
            active={intensityFilter === "gentle"} 
            onClick={() => setIntensityFilter(intensityFilter === "gentle" ? null : "gentle")}
          />
          <FilterBadge 
            label="Moderate" 
            active={intensityFilter === "moderate"} 
            onClick={() => setIntensityFilter(intensityFilter === "moderate" ? null : "moderate")}
          />
          <FilterBadge 
            label="Restorative" 
            active={intensityFilter === "restorative"} 
            onClick={() => setIntensityFilter(intensityFilter === "restorative" ? null : "restorative")}
          />
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Stress Relief For</h3>
        <div className="flex flex-wrap gap-2">
          <FilterBadge 
            label="Work Stress" 
            active={stressTypeFilter === "work"} 
            onClick={() => setStressTypeFilter(stressTypeFilter === "work" ? null : "work")}
          />
          <FilterBadge 
            label="Sleep Prep" 
            active={stressTypeFilter === "sleep"} 
            onClick={() => setStressTypeFilter(stressTypeFilter === "sleep" ? null : "sleep")}
          />
          <FilterBadge 
            label="Energy Refresh" 
            active={stressTypeFilter === "refresh"} 
            onClick={() => setStressTypeFilter(stressTypeFilter === "refresh" ? null : "refresh")}
          />
        </div>
      </div>
    </div>
  );
};

interface FilterBadgeProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const FilterBadge = ({ label, active, onClick }: FilterBadgeProps) => {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className={`cursor-pointer ${
        active 
          ? "bg-blue-500 hover:bg-blue-600 text-white" 
          : "bg-transparent hover:bg-blue-100 dark:hover:bg-blue-900/20"
      }`}
      onClick={onClick}
    >
      {label}
    </Badge>
  );
};
