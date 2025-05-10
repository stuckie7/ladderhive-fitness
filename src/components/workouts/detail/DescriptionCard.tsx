
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DescriptionCardProps {
  description?: string;
  benefits?: string;
}

const DescriptionCard: React.FC<DescriptionCardProps> = ({ description, benefits }) => {
  if (!description && !benefits) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>About This Workout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && (
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        )}
        
        {benefits && (
          <div>
            <h3 className="font-medium mb-2">Benefits</h3>
            <p className="text-muted-foreground">{benefits}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DescriptionCard;
