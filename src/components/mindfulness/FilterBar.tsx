
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, ActivitySquare, Brain } from "lucide-react";

interface FilterBarProps {
  timeFilter: string | null;
  setTimeFilter: (value: string | null) => void;
  intensityFilter: string | null;
  setIntensityFilter: (value: string | null) => void;
  stressTypeFilter: string | null;
  setStressTypeFilter: (value: string | null) => void;
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
      <Card className="p-4">
        <h3 className="font-medium flex items-center mb-3">
          <Clock className="h-4 w-4 mr-2" /> Time Needed
        </h3>
        <div className="flex flex-col gap-2">
          {["quick", "medium", "extended"].map((time) => (
            <Button
              key={time}
              variant={timeFilter === time ? "default" : "outline"}
              size="sm"
              className="justify-start"
              onClick={() => setTimeFilter(timeFilter === time ? null : time)}
            >
              {time === "quick" && "Quick (5-15 min)"}
              {time === "medium" && "Medium (15-30 min)"}
              {time === "extended" && "Extended (30+ min)"}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium flex items-center mb-3">
          <ActivitySquare className="h-4 w-4 mr-2" /> Intensity Level
        </h3>
        <div className="flex flex-col gap-2">
          {["gentle", "moderate", "vigorous"].map((intensity) => (
            <Button
              key={intensity}
              variant={intensityFilter === intensity ? "default" : "outline"}
              size="sm"
              className="justify-start"
              onClick={() => setIntensityFilter(intensityFilter === intensity ? null : intensity)}
            >
              {intensity === "gentle" && "Gentle"}
              {intensity === "moderate" && "Moderate"}
              {intensity === "vigorous" && "Vigorous"}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium flex items-center mb-3">
          <Brain className="h-4 w-4 mr-2" /> Stress Type
        </h3>
        <div className="flex flex-col gap-2">
          {["anxiety", "focus", "energy", "sleep", "relaxation"].map((type) => (
            <Button
              key={type}
              variant={stressTypeFilter === type ? "default" : "outline"}
              size="sm"
              className="justify-start"
              onClick={() => setStressTypeFilter(stressTypeFilter === type ? null : type)}
            >
              {type === "anxiety" && "Anxiety Relief"}
              {type === "focus" && "Improve Focus"}
              {type === "energy" && "Boost Energy"}
              {type === "sleep" && "Better Sleep"}
              {type === "relaxation" && "Deep Relaxation"}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};
