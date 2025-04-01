
import { Badge } from "@/components/ui/badge";

interface Workout {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

interface WorkoutDetailHeaderProps {
  workout: Workout;
}

const WorkoutDetailHeader = ({ workout }: WorkoutDetailHeaderProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'elite':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">{workout.title}</h1>
        <p className="text-muted-foreground mt-1">{workout.description}</p>
      </div>
      <div className="mt-4 md:mt-0 flex items-center">
        <Badge 
          className={`text-sm px-3 py-1 ${getDifficultyColor(workout.difficulty)}`}
        >
          {workout.difficulty}
        </Badge>
      </div>
    </div>
  );
};

export default WorkoutDetailHeader;
