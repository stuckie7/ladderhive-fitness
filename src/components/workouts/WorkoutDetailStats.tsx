
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Dumbbell, CalendarClock } from "lucide-react";

interface WorkoutDetailStatsProps {
  duration: number;
  exerciseCount: number;
}

const WorkoutDetailStats = ({ duration, exerciseCount }: WorkoutDetailStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 flex items-center">
          <Clock className="h-6 w-6 mr-3 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">{duration} minutes</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex items-center">
          <Dumbbell className="h-6 w-6 mr-3 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Exercises</p>
            <p className="font-medium">{exerciseCount}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex items-center">
          <CalendarClock className="h-6 w-6 mr-3 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Next scheduled</p>
            <p className="font-medium">Not scheduled</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutDetailStats;
