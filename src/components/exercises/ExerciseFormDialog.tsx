
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExerciseFull } from "@/types/exercise";

interface ExerciseFormState {
  name: string;
  prime_mover_muscle: string;
  primary_equipment: string;
  difficulty: string;
  short_youtube_demo: string;
}

interface ExerciseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  formState: ExerciseFormState;
  onFormChange: (field: string, value: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  muscleGroups: string[];
  equipmentTypes: string[];
}

const ExerciseFormDialog = ({
  open,
  onOpenChange,
  title,
  description,
  formState = {
    name: '',
    prime_mover_muscle: '',
    primary_equipment: '',
    difficulty: '',
    short_youtube_demo: ''
  },
  onFormChange,
  onSubmit,
  submitLabel,
  muscleGroups = [],
  equipmentTypes = []
}: ExerciseFormDialogProps) => {
  // Ensure formState is never undefined
  const safeFormState = formState || {
    name: '',
    prime_mover_muscle: '',
    primary_equipment: '',
    difficulty: '',
    short_youtube_demo: ''
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input 
              id="name"
              name="name" 
              placeholder="Exercise name" 
              value={safeFormState.name || ''} 
              onChange={(e) => onFormChange('name', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="muscle-group" className="text-sm font-medium">Target Muscle Group</label>
              <Input 
                id="muscle-group"
                name="prime_mover_muscle"
                list="muscle-groups"
                placeholder="Target muscle" 
                value={safeFormState.prime_mover_muscle || ''} 
                onChange={(e) => onFormChange('prime_mover_muscle', e.target.value)}
              />
              <datalist id="muscle-groups">
                {(muscleGroups || []).map(group => (
                  <option key={group} value={group} />
                ))}
              </datalist>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="equipment" className="text-sm font-medium">Equipment</label>
              <Input 
                id="equipment"
                name="primary_equipment"
                list="equipments"
                placeholder="Equipment needed" 
                value={safeFormState.primary_equipment || ''} 
                onChange={(e) => onFormChange('primary_equipment', e.target.value)}
              />
              <datalist id="equipments">
                {(equipmentTypes || []).map(eq => (
                  <option key={eq} value={eq} />
                ))}
              </datalist>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="difficulty" className="text-sm font-medium">Difficulty Level</label>
            <Select 
              name="difficulty"
              value={safeFormState.difficulty || ''} 
              onValueChange={(value) => onFormChange('difficulty', value)}
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="video" className="text-sm font-medium">Video URL</label>
            <Input 
              id="video"
              name="short_youtube_demo"
              placeholder="YouTube video URL" 
              value={safeFormState.short_youtube_demo || ''} 
              onChange={(e) => onFormChange('short_youtube_demo', e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseFormDialog;
