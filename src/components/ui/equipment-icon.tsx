import React from 'react';
import { Dumbbell, User } from 'lucide-react';

interface EquipmentIconProps {
  equipment: string;
  size?: number;
}

export function EquipmentIcon({ equipment, size = 16 }: EquipmentIconProps) {
  const iconMap = {
    dumbbells: <Dumbbell size={size} />,
    barbell: <Dumbbell size={size} />,
    bodyweight: <User size={size} />,
    kettlebells: <Dumbbell size={size} />,
    machine: <div className="w-4 h-4 bg-gray-300 rounded-lg" />,
    bands: <div className="w-4 h-4 bg-blue-300 rounded-full" />,
  };

  return iconMap[equipment] || <div className="w-4 h-4 bg-gray-400 rounded" />;
}
