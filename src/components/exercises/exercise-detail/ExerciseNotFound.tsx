
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";

interface ExerciseNotFoundProps {
  onBackClick: () => void;
}

export default function ExerciseNotFound({ onBackClick }: ExerciseNotFoundProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <Button variant="outline" className="mb-6" onClick={onBackClick}>
        <Dumbbell className="h-4 w-4 mr-2" />
        Back to Exercises
      </Button>
      <div className="text-center py-12">
        <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Exercise Not Found</h1>
        <p className="text-muted-foreground mb-6">The exercise you are looking for doesn't exist or has been removed.</p>
        <Button onClick={onBackClick}>
          Return to Exercise Library
        </Button>
      </div>
    </div>
  );
}
