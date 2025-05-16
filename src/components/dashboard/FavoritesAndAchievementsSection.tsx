
import React from 'react';
import FavoriteExercises from "@/components/dashboard/FavoriteExercises";
import AchievementCard from "@/components/dashboard/AchievementCard";
import { Exercise } from "@/types/exercise";

interface FavoritesAndAchievementsSectionProps {
  favoriteExercises: Exercise[];
  achievements: any[];
  isLoading: boolean;
  onAddFavorite: () => void;
  onRemoveFavorite: (id: string) => Promise<void>;
}

const FavoritesAndAchievementsSection: React.FC<FavoritesAndAchievementsSectionProps> = ({
  favoriteExercises,
  achievements,
  isLoading,
  onAddFavorite,
  onRemoveFavorite
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <FavoriteExercises 
        exercises={favoriteExercises} 
        isLoading={isLoading}
        onAddExercise={onAddFavorite}
        onRemoveFavorite={onRemoveFavorite}
      />
      <AchievementCard 
        achievements={achievements} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default FavoritesAndAchievementsSection;
