
interface FitnessStatsProps {
  height: number;
  weight: number;
  age: number;
}

const FitnessStats = ({ height, weight, age }: FitnessStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center p-2">
        <p className="text-sm text-muted-foreground">Height</p>
        <p className="text-lg font-semibold">{height} cm</p>
      </div>
      <div className="text-center p-2">
        <p className="text-sm text-muted-foreground">Weight</p>
        <p className="text-lg font-semibold">{weight} kg</p>
      </div>
      <div className="text-center p-2">
        <p className="text-sm text-muted-foreground">Age</p>
        <p className="text-lg font-semibold">{age}</p>
      </div>
    </div>
  );
};

export default FitnessStats;
