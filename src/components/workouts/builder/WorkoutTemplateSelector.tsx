
import React from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkoutTemplate } from "@/hooks/workout-builder/template-management/template-types";
import { Calendar, ChevronRight, Copy, Dumbbell, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface WorkoutTemplateSelectorProps {
  templates: WorkoutTemplate[];
  onSelectTemplate: (templateId: string) => Promise<void>; // Renamed from onSelect
  onDeleteTemplate?: (templateId: string) => Promise<void>;
  onClose: () => void; // Keep the onClose prop
}

const WorkoutTemplateSelector: React.FC<WorkoutTemplateSelectorProps> = ({
  templates,
  onSelectTemplate,
  onDeleteTemplate,
  onClose
}) => {
  const handleSelectTemplate = async (templateId: string) => {
    await onSelectTemplate(templateId);
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Copy className="h-5 w-5 mr-2" />
          Workout Templates
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 my-4">
        {templates.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-gray-700 rounded-lg">
            <Dumbbell className="mx-auto h-12 w-12 text-gray-500 mb-2" />
            <h3 className="text-lg font-medium">No templates yet</h3>
            <p className="text-muted-foreground mt-1">
              Save a workout as template to see it here.
            </p>
          </div>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="bg-gray-900/50 hover:bg-gray-900/80 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{template.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="capitalize">{template.category}</span>
                      <span className="mx-1">•</span>
                      <span className="capitalize">{template.difficulty}</span>
                    </div>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {template.description}
                      </p>
                    )}
                    {template.created_at && (
                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{format(new Date(template.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <div>
                  {onDeleteTemplate && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-950/20"
                      onClick={() => onDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  Use Template
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </DialogContent>
  );
};

export default WorkoutTemplateSelector;
