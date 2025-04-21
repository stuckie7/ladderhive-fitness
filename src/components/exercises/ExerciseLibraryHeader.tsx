
import { Button } from "@/components/ui/button";

interface ExerciseLibraryHeaderProps {
  importDialogOpen?: boolean;
  setImportDialogOpen?: (open: boolean) => void;
}

const ExerciseLibraryHeader = ({ 
  importDialogOpen = false, 
  setImportDialogOpen = () => {} 
}: ExerciseLibraryHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">Exercise Library</h1>
    </div>
  );
};

export default ExerciseLibraryHeader;
