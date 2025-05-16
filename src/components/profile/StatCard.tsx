
import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  value: number;
  label: string;
}

const StatCard = ({ icon, value, label }: StatCardProps) => {
  return (
    <div>
      <div className="flex flex-col items-center">
        {icon}
        <p className="text-xl font-semibold mt-1">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
