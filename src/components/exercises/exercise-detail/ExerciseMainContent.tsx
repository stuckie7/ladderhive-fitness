
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Exercise } from "@/types/exercise";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Flame, Target } from "lucide-react";

interface ExerciseMainContentProps {
  exercise: Exercise | null;
  loading?: boolean;
}

export default function ExerciseMainContent({ exercise, loading = false }: ExerciseMainContentProps) {
  if (loading || !exercise) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="h-5 bg-muted rounded animate-pulse w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" /> 
          Exercise Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key information cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Target Muscle</h3>
            </div>
            <p className="text-sm">{exercise.target || exercise.prime_mover_muscle || 'Not specified'}</p>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Equipment</h3>
            </div>
            <p className="text-sm">{exercise.equipment || exercise.primary_equipment || 'Not specified'}</p>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Difficulty</h3>
            </div>
            <p className="text-sm capitalize">{exercise.difficulty || 'Not specified'}</p>
          </div>
        </div>
        
        {/* Description */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Description</h3>
          <p className="text-muted-foreground leading-relaxed">
            {exercise.description || 'No description available for this exercise.'}
          </p>
        </div>
        
        {/* Secondary details if available */}
        {(exercise.mechanics || exercise.force_type || exercise.posture || exercise.laterality) && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Additional Details</h3>
            <div className="flex flex-wrap gap-2">
              {exercise.mechanics && (
                <Badge variant="outline" className="bg-accent/50">
                  {exercise.mechanics}
                </Badge>
              )}
              {exercise.force_type && (
                <Badge variant="outline" className="bg-accent/50">
                  {exercise.force_type}
                </Badge>
              )}
              {exercise.posture && (
                <Badge variant="outline" className="bg-accent/50">
                  {exercise.posture}
                </Badge>
              )}
              {exercise.laterality && (
                <Badge variant="outline" className="bg-accent/50">
                  {exercise.laterality}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
