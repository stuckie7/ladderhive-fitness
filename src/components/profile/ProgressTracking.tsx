
import { Button } from "@/components/ui/button";
import { BarChart3, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProgressTracking = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">
            Start tracking workouts to see your progress charts
          </p>
        </div>
      </div>
      
      <Button
        className="w-full bg-fitness-primary hover:bg-fitness-primary/90"
        onClick={() => navigate('/progress')}
      >
        <span>View Detailed Progress</span>
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export default ProgressTracking;
