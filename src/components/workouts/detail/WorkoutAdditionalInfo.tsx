
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Target, Clock, Calendar } from "lucide-react";

interface WorkoutAdditionalInfoProps {
  goal?: string;
  category?: string;
  equipment_needed?: string;
  benefits?: string;
  instructions?: string;
  modifications?: string;
  created_at?: string;
}

const WorkoutAdditionalInfo: React.FC<WorkoutAdditionalInfoProps> = ({
  goal,
  category,
  equipment_needed,
  benefits,
  instructions,
  modifications,
  created_at
}) => {
  // Format created_at date if available
  const formattedDate = created_at ? new Date(created_at).toLocaleDateString() : null;
  
  // Process benefits into an array if it's a string
  const benefitsArray = benefits?.split(',') || [];
  
  // Format equipment items
  const equipmentItems = equipment_needed?.split(',') || [];

  return (
    <div className="space-y-6">
      {/* Workout Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(goal || category) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Workout Focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {goal && (
                <div className="flex items-start gap-2">
                  <Target className="h-5 w-5 text-fitness-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Goal</p>
                    <p className="text-muted-foreground">{goal}</p>
                  </div>
                </div>
              )}
              
              {category && (
                <div className="flex items-start gap-2">
                  <Dumbbell className="h-5 w-5 text-fitness-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Category</p>
                    <p className="text-muted-foreground">{category}</p>
                  </div>
                </div>
              )}
              
              {formattedDate && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-fitness-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Added</p>
                    <p className="text-muted-foreground">{formattedDate}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {equipment_needed && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Equipment Needed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {equipmentItems.map((item, index) => (
                  <Badge key={index} variant="outline" className="bg-muted">
                    {item.trim()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Benefits Section */}
      {benefits && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {benefitsArray.map((benefit, index) => (
                <li key={index} className="text-muted-foreground">{benefit.trim()}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Instructions Section */}
      {instructions && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">How To Perform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-muted-foreground whitespace-pre-line">{instructions}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Modifications Section */}
      {modifications && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Modifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-muted-foreground whitespace-pre-line">{modifications}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkoutAdditionalInfo;
