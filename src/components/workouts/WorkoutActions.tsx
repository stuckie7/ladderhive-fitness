
import { Button } from "@/components/ui/button";
import { Check, Save } from "lucide-react";

interface WorkoutActionsProps {
  isSaved: boolean;
  isLoading: boolean;
  onSave: () => Promise<void>;
  onComplete: () => Promise<void>;
}

const WorkoutActions = ({ 
  isSaved, 
  isLoading, 
  onSave, 
  onComplete 
}: WorkoutActionsProps) => {
  return (
    <div className="flex justify-end gap-3 mb-6">
      <Button 
        variant={isSaved ? "outline" : "default"}
        onClick={onSave}
        disabled={isLoading}
        className={isSaved ? "border-fitness-primary text-fitness-primary" : "bg-fitness-primary hover:bg-fitness-primary/90"}
      >
        {isSaved ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Saved
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Workout
          </>
        )}
      </Button>
      
      <Button 
        onClick={onComplete}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Check className="h-4 w-4 mr-2" />
        Mark as Complete
      </Button>
    </div>
  );
};

export default WorkoutActions;
