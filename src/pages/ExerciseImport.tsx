
import AppLayout from "@/components/layout/AppLayout";
import ExcelImportForm from "@/components/exercises/ExcelImportForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ExerciseImport = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Link to="/exercises">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Exercise Library
            </Button>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Import Exercises</h1>
        <p className="text-muted-foreground mb-8">
          Use this tool to import exercises from an Excel spreadsheet into your exercise database.
          Make sure your spreadsheet follows the required format.
        </p>
        
        <ExcelImportForm />
      </div>
    </AppLayout>
  );
};

export default ExerciseImport;
