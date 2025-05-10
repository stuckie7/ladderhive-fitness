
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Medal, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'award' | 'medal';
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface AchievementCardProps {
  achievements: Achievement[];
  isLoading: boolean;
}

const AchievementIcon = ({ icon, className = "" }: { icon: string; className?: string }) => {
  switch (icon) {
    case 'trophy':
      return <Trophy className={className} />;
    case 'medal':
      return <Medal className={className} />;
    case 'award':
    default:
      return <Award className={className} />;
  }
};

const AchievementCard = ({ achievements, isLoading }: AchievementCardProps) => {
  // Sort achievements: unlocked first, then by progress percentage
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.unlockedAt && !b.unlockedAt) return -1;
    if (!a.unlockedAt && b.unlockedAt) return 1;
    
    // If both are unlocked/locked, compare by progress percentage
    const aProgress = a.progress && a.maxProgress ? (a.progress / a.maxProgress) : 0;
    const bProgress = b.progress && b.maxProgress ? (b.progress / b.maxProgress) : 0;
    return bProgress - aProgress;
  });
  
  // Limit to 4 achievements for display
  const displayAchievements = sortedAchievements.slice(0, 4);
  
  return (
    <Card className="glass-panel h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2 text-amber-400">
          <Trophy className="h-5 w-5" />
          <span>Achievements</span>
        </CardTitle>
        <Link to="/achievements">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <span>View All</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : displayAchievements.length > 0 ? (
          <div className="space-y-3">
            {displayAchievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-3 rounded-lg border transition-all ${
                  achievement.unlockedAt 
                    ? "border-amber-500/30 bg-amber-950/20" 
                    : "border-gray-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    achievement.unlockedAt 
                      ? "bg-amber-500/20" 
                      : "bg-gray-800/30"
                  }`}>
                    <AchievementIcon 
                      icon={achievement.icon} 
                      className={`h-5 w-5 ${
                        achievement.unlockedAt 
                          ? "text-amber-400" 
                          : "text-gray-400"
                      }`} 
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium flex items-center gap-2">
                      {achievement.title}
                      {achievement.unlockedAt && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                          Unlocked
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                    {!achievement.unlockedAt && achievement.progress !== undefined && (
                      <div className="mt-2 w-full bg-gray-800/50 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500/70 h-full rounded-full"
                          style={{ 
                            width: `${Math.min(100, (achievement.progress / (achievement.maxProgress || 1)) * 100)}%` 
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.progress}/{achievement.maxProgress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-white">No achievements yet</h3>
            <p className="mt-2 text-gray-400">
              Complete workouts and challenges to earn achievements
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
