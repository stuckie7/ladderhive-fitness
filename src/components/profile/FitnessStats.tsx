
interface FitnessStatsProps {
  height: number;
  weight: number;
  age: number;
}

import { Button } from "@/components/ui/button";
import { useState } from "react";
import EditFitnessStatsDialog from "./EditFitnessStatsDialog";

const FitnessStats = ({ height, weight, age, fitnessGoals = [], workoutDays = [], onUpdated }: FitnessStatsProps & { fitnessGoals?: string[]; workoutDays?: string[]; onUpdated?: () => void; }) => {
  // Convert height from cm to feet and inches
  // height stored in inches
  const heightInFeet = Math.floor(height / 12);
  const heightInInches = Math.round(height % 12);
  
  const weightInLbs = weight;
  
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-end mb-2">
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
      <div className="text-center p-2">
        <p className="text-sm text-muted-foreground">Height</p>
        <p className="text-lg font-semibold">{heightInFeet}'{heightInInches}"</p>
      </div>
      <div className="text-center p-2">
        <p className="text-sm text-muted-foreground">Weight</p>
        <p className="text-lg font-semibold">{weightInLbs} lbs</p>
      </div>
      <div className="text-center p-2">
        <p className="text-sm text-muted-foreground">Age</p>
        <p className="text-lg font-semibold">{age}</p>
      </div>
          </div>
      <EditFitnessStatsDialog
        open={open}
        onOpenChange={setOpen}
        initial={{ height, weight, age, fitnessGoals, workoutDays }}
        onSaved={onUpdated}
      />
    </div>
  );
};

export default FitnessStats;
