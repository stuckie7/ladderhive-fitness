
interface FitnessStatsProps {
  height: number;
  weight: number;
  age: number;
}

const FitnessStats = ({ height, weight, age }: FitnessStatsProps) => {
  // Convert height from cm to feet and inches
  const heightInFeet = Math.floor(height / 30.48);
  const heightInInches = Math.round((height / 2.54) % 12);
  
  // Convert weight from kg to lbs
  const weightInLbs = Math.round(weight * 2.20462);
  
  return (
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
  );
};

export default FitnessStats;
