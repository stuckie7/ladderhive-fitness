
import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileSpreadsheet, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Exercise } from "@/types/exercise";

interface ExcelImportFormProps {
  onImportComplete?: () => void;
}

const ExcelImportForm = ({ onImportComplete }: ExcelImportFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Exercise[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setPreview([]);
    
    if (selectedFile) {
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const data = XLSX.utils.sheet_to_json<any>(worksheet);
      
      if (data.length === 0) {
        throw new Error("The Excel file appears to be empty");
      }
      
      // Map Excel columns to our Exercise type
      // Expecting columns: name, muscle_group, equipment, difficulty, description
      const mappedData = data.map((row, index) => {
        if (!row.name) {
          throw new Error(`Row ${index + 1} is missing the required 'name' field`);
        }
        
        return {
          id: crypto.randomUUID(), // Generate temporary ID for preview
          name: row.name,
          muscle_group: row.muscle_group || row.bodyPart || '',
          equipment: row.equipment || '',
          difficulty: row.difficulty || 'Intermediate',
          description: row.description || '',
          image_url: row.image_url || '',
          video_url: row.video_url || ''
        } as Exercise;
      });
      
      setPreview(mappedData.slice(0, 5)); // Show first 5 exercises as preview
    } catch (err: any) {
      setError(err.message || "Failed to parse Excel file");
      console.error("Excel parsing error:", err);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const data = XLSX.utils.sheet_to_json<any>(worksheet);
      
      if (data.length === 0) {
        throw new Error("The Excel file appears to be empty");
      }
      
      // Map Excel columns to our Exercise schema
      const mappedData = data.map((row) => ({
        name: row.name,
        muscle_group: row.muscle_group || row.bodyPart || null,
        equipment: row.equipment || null,
        difficulty: row.difficulty || 'Intermediate',
        description: row.description || null,
        image_url: row.image_url || null,
        video_url: row.video_url || null
      }));
      
      // Insert data in batches of 50 to avoid hitting size limits
      const batchSize = 50;
      let successCount = 0;
      
      for (let i = 0; i < mappedData.length; i += batchSize) {
        const batch = mappedData.slice(i, i + batchSize);
        const { error, count } = await supabase
          .from('exercises')
          .insert(batch)
          .select('count');
        
        if (error) throw error;
        if (count) successCount += count;
      }
      
      toast({
        title: "Import successful",
        description: `Successfully imported ${successCount} exercises`,
      });
      
      setFile(null);
      setPreview([]);
      
      // Reset file input
      const fileInput = document.getElementById('excel-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Call onImportComplete callback if provided
      if (onImportComplete) {
        onImportComplete();
      }
      
    } catch (err: any) {
      console.error("Import error:", err);
      setError(err.message || "Failed to import exercises");
      toast({
        title: "Import failed",
        description: err.message || "An error occurred while importing exercises",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>
          <Button 
            onClick={handleImport} 
            disabled={!file || isUploading}
            className="bg-primary hover:bg-primary/90"
          >
            {isUploading ? (
              "Importing..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Import
              </>
            )}
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {preview.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Preview (first 5 entries):</h3>
            <div className="bg-muted p-4 rounded-md overflow-auto max-h-64">
              <pre className="text-xs">{JSON.stringify(preview, null, 2)}</pre>
            </div>
          </div>
        )}
        
        <div className="bg-muted p-4 rounded-md mt-4">
          <h3 className="text-md font-medium mb-2 flex items-center">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel Format Requirements
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Your Excel file should have the following columns:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li><strong>name</strong> (required): The name of the exercise</li>
            <li><strong>muscle_group</strong>: Primary muscle group targeted</li>
            <li><strong>equipment</strong>: Equipment needed for the exercise</li>
            <li><strong>difficulty</strong>: Beginner, Intermediate, or Advanced</li>
            <li><strong>description</strong>: Description or instructions</li>
            <li><strong>image_url</strong>: URL to an image demonstration</li>
            <li><strong>video_url</strong>: URL to a video demonstration</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExcelImportForm;
