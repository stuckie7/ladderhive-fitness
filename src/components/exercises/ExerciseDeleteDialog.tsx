
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExerciseFull } from "@/types/exercise";

interface ExerciseDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: ExerciseFull | null;
  onConfirmDelete: () => void;
}

const ExerciseDeleteDialog = ({
  open,
  onOpenChange,
  exercise,
  onConfirmDelete
}: ExerciseDeleteDialogProps) => {
  if (!exercise) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this exercise? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="font-medium">{exercise.name}</p>
          <div className="flex gap-2 mt-2">
            {exercise.prime_mover_muscle && (
              <Badge variant="outline">{exercise.prime_mover_muscle}</Badge>
            )}
            {exercise.primary_equipment && (
              <Badge variant="outline">{exercise.primary_equipment}</Badge>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirmDelete}>Delete Exercise</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDeleteDialog;
