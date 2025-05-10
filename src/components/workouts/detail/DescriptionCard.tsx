
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DescriptionCardProps {
  description?: string;
  benefits?: string;
}

const DescriptionCard: React.FC<DescriptionCardProps> = ({ description, benefits }) => {
  if (!description && !benefits) return null;
  
  // Convert benefits string to array if it exists
  const benefitsArray = benefits?.split(',').map(item => item.trim()) || [];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>About This Workout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && (
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">{description}</p>
          </div>
        )}
        
        {benefits && benefitsArray.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Key Benefits</h3>
            <ul className="list-disc pl-5 space-y-1">
              {benefitsArray.map((benefit, index) => (
                <li key={index} className="text-muted-foreground">{benefit}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DescriptionCard;
