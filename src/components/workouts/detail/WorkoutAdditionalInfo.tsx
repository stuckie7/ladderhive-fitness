
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';

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
  instructions,
  modifications,
  created_at
}) => {
  // Check if we have any data to display
  const hasData = goal || category || equipment_needed || instructions || modifications;
  
  if (!hasData) return null;
  
  // Parse equipment into array if it exists
  const equipmentArray = equipment_needed?.split(',').map(item => item.trim()).filter(Boolean) || [];
  
  // Format created_at date if it exists
  const formattedDate = created_at 
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true })
    : null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(goal || category) && (
            <div>
              <h3 className="font-medium mb-2">Workout Details</h3>
              <ul className="space-y-1">
                {goal && (
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-muted-foreground">Goal:</span> 
                    <span>{goal}</span>
                  </li>
                )}
                {category && (
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-muted-foreground">Category:</span> 
                    <span>{category}</span>
                  </li>
                )}
                {formattedDate && (
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-muted-foreground">Added:</span> 
                    <span>{formattedDate}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {equipmentArray.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Equipment Needed</h3>
              <ul className="list-disc pl-5 space-y-1">
                {equipmentArray.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {instructions && (
          <div>
            <h3 className="font-medium mb-2">Instructions</h3>
            <p className="text-muted-foreground whitespace-pre-line">{instructions}</p>
          </div>
        )}
        
        {modifications && (
          <div>
            <h3 className="font-medium mb-2">Modifications</h3>
            <p className="text-muted-foreground whitespace-pre-line">{modifications}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutAdditionalInfo;
