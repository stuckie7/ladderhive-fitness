
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExerciseFull } from "@/types/exercise";

interface ExerciseSidebarInfoProps {
  exercise: ExerciseFull;
}

export default function ExerciseSidebarInfo({ exercise }: ExerciseSidebarInfoProps) {
  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Key Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
              <div>
                <p className="font-semibold">Primary Muscle</p>
                <p className="text-muted-foreground">{exercise.prime_mover_muscle || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
              <div>
                <p className="font-semibold">Equipment</p>
                <p className="text-muted-foreground">{exercise.primary_equipment || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-3"></div>
              <div>
                <p className="font-semibold">Difficulty</p>
                <p className="text-muted-foreground">{exercise.difficulty || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-3"></div>
              <div>
                <p className="font-semibold">Mechanics</p>
                <p className="text-muted-foreground">{exercise.mechanics || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
              <div>
                <p className="font-semibold">Force Type</p>
                <p className="text-muted-foreground">{exercise.force_type || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Related Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Related exercises will be shown here based on the same muscle group and equipment.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
