import React from 'react';
import { Badge } from "@/components/ui/badge";

interface DifficultyBadgeProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const badgeColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <Badge className={`text-xs px-2 py-1 rounded-full ${badgeColors[difficulty]}`}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </Badge>
  );
}
