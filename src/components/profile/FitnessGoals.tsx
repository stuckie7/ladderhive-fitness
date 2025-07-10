
interface FitnessGoalsProps {
  goals: string[];
}

const FitnessGoals = ({ goals }: FitnessGoalsProps) => {
  return (
    <div>
      <p className="text-sm font-medium mb-2">Fitness Goals</p>
      <div className="flex flex-wrap gap-2">
        {goals.map((goal, index) => (
          <span 
            key={index}
            className="bg-fitness-primary/10 text-fitness-primary text-xs px-2 py-1 rounded-full"
          >
            {goal.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </span>
        ))}
      </div>
    </div>
  );
};

export default FitnessGoals;
