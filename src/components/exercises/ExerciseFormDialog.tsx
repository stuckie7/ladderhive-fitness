
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import { ExerciseFull } from "@/types/exercise";

interface ExerciseFormState {
  name: string;
  prime_mover_muscle: string;
  secondary_muscles: string[];
  primary_equipment: string;
  equipment_options: string[];
  difficulty: string;
  exercise_type: string;
  intensity_level: string;
  rest_time: number;
  recommended_sets: number;
  recommended_reps: number;
  safety_notes: string;
  short_youtube_demo: string;
}

// Helper type for default values
interface DefaultExerciseFormState {
  name: string;
  prime_mover_muscle: string;
  secondary_muscles: string[];
  primary_equipment: string;
  equipment_options: string[];
  difficulty: string;
  exercise_type: string;
  intensity_level: string;
  rest_time: number;
  recommended_sets: number;
  recommended_reps: number;
  safety_notes: string;
  short_youtube_demo: string;
}

interface ExerciseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  formState?: ExerciseFormState;
  onFormChange: (field: keyof ExerciseFormState, value: any) => void;
  onSubmit: () => void;
  submitLabel: string;
  muscleGroups: string[];
  equipmentTypes: string[];
  exerciseTypes: string[];
  intensityLevels: string[];
}

const ExerciseFormDialog = ({
  open,
  onOpenChange,
  title,
  description,
  formState = {
    name: '',
    prime_mover_muscle: '',
    secondary_muscles: [],
    primary_equipment: '',
    equipment_options: [],
    difficulty: '',
    exercise_type: '',
    intensity_level: '',
    rest_time: 0,
    recommended_sets: 0,
    recommended_reps: 0,
    safety_notes: '',
    short_youtube_demo: ''
  } as ExerciseFormState,
  onFormChange,
  onSubmit,
  submitLabel,
  muscleGroups = [],
  equipmentTypes = [],
  exerciseTypes = [],
  intensityLevels = []
}: ExerciseFormDialogProps) => {
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(formState.secondary_muscles || []);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(formState.equipment_options || []);

  const handleMuscleChange = (value: string[]) => {
    setSelectedMuscles(value);
    onFormChange('secondary_muscles', value);
  };

  const handleEquipmentChange = (value: string[]) => {
    setSelectedEquipment(value);
    onFormChange('equipment_options', value);
  };
  // Ensure formState is never undefined
  const safeFormState = formState || {
    name: '',
    prime_mover_muscle: '',
    secondary_muscles: [],
    primary_equipment: '',
    equipment_options: [],
    difficulty: '',
    exercise_type: '',
    intensity_level: '',
    rest_time: 0,
    recommended_sets: 0,
    recommended_reps: 0,
    safety_notes: '',
    short_youtube_demo: ''
  } as ExerciseFormState;
  
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
              <label htmlFor="muscle-group" className="text-sm font-medium">Primary Muscle Group</label>
              <Select
                value={safeFormState.prime_mover_muscle}
                onValueChange={(value) => onFormChange('prime_mover_muscle', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary muscle" />
                </SelectTrigger>
                <SelectContent>
                  {muscleGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="secondary-muscles" className="text-sm font-medium">Secondary Muscles</label>
              <Select
                value={selectedMuscles.join(',')}
                onValueChange={(value) => handleMuscleChange(value.split(','))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select secondary muscles" />
                </SelectTrigger>
                <SelectContent>
                  {muscleGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="equipment" className="text-sm font-medium">Primary Equipment</label>
              <Select
                value={safeFormState.primary_equipment}
                onValueChange={(value) => onFormChange('primary_equipment', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentTypes.map((eq) => (
                    <SelectItem key={eq} value={eq}>
                      {eq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="equipment-options" className="text-sm font-medium">Alternative Equipment</label>
              <Select
                value={selectedEquipment.join(',')}
                onValueChange={(value) => handleEquipmentChange(value.split(','))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select alternative equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentTypes.map((eq) => (
                    <SelectItem key={eq} value={eq}>
                      {eq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="sets" className="text-sm font-medium">Recommended Sets</label>
              <Input
                type="number"
                id="sets"
                name="recommended_sets"
                value={safeFormState.recommended_sets}
                onChange={(e) => onFormChange('recommended_sets', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="reps" className="text-sm font-medium">Recommended Reps</label>
              <Input
                type="number"
                id="reps"
                name="recommended_reps"
                value={safeFormState.recommended_reps}
                onChange={(e) => onFormChange('recommended_reps', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="youtube" className="text-sm font-medium">YouTube Demo URL</label>
            <Input
              id="youtube"
              name="short_youtube_demo"
              placeholder="YouTube video URL"
              value={safeFormState.short_youtube_demo}
              onChange={(e) => onFormChange('short_youtube_demo', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="safety-notes" className="text-sm font-medium">Safety Notes</label>
            <textarea
              id="safety-notes"
              name="safety_notes"
              className="w-full p-2 border rounded-md"
              rows={4}
              value={safeFormState.safety_notes}
              onChange={(e) => onFormChange('safety_notes', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="difficulty" className="text-sm font-medium">Difficulty</label>
            <Select
              value={safeFormState.difficulty}
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
