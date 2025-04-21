
import { Button } from "@/components/ui/button";
import { PlusIcon, UploadIcon } from "lucide-react";
import { useState } from "react";

export interface ExerciseLibraryHeaderProps {
  importDialogOpen?: boolean;
  setImportDialogOpen?: (open: boolean) => void;
}

const ExerciseLibraryHeader = ({ 
  importDialogOpen = false, 
  setImportDialogOpen = () => {} 
}: ExerciseLibraryHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
      <div>
        <h2 className="text-lg font-medium">Manage your exercise library</h2>
        <p className="text-sm text-muted-foreground">
          Browse, search, and filter through exercises
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={() => setImportDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <UploadIcon className="h-4 w-4" />
          <span>Import</span>
        </Button>
        <Button className="flex items-center gap-1">
          <PlusIcon className="h-4 w-4" />
          <span>New Exercise</span>
        </Button>
      </div>
    </div>
  );
};

export default ExerciseLibraryHeader;
