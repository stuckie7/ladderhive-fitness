
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import ExcelImport from "./ExcelImport";

interface ExerciseLibraryHeaderProps {
  importDialogOpen: boolean;
  setImportDialogOpen: (open: boolean) => void;
}

const ExerciseLibraryHeader = ({ 
  importDialogOpen, 
  setImportDialogOpen 
}: ExerciseLibraryHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">Exercise Library</h1>
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex gap-2">
            <Upload size={16} />
            <span>Import Excel</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Exercises from Excel</DialogTitle>
          </DialogHeader>
          <ExcelImport />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseLibraryHeader;
