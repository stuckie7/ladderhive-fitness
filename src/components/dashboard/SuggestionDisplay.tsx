import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface SuggestionDisplayProps {
  suggestion: string | null;
}

const SuggestionDisplay: React.FC<SuggestionDisplayProps> = ({ suggestion }) => {
  if (!suggestion) {
    return null;
  }

  return (
    <Card className="mb-4 bg-sky-900/70 border-sky-700">
      <CardContent className="p-4">
        <div className="flex items-center">
          <Lightbulb className="h-5 w-5 mr-3 text-sky-400" />
          <p className="text-sm text-sky-100">{suggestion}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestionDisplay;
