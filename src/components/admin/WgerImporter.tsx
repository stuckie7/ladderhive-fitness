
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Database } from "lucide-react";
import { importWgerExercises, previewWgerExercises } from "@/services/wgerDataImporter";

const WgerImporter = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [previewData, setPreviewData] = useState<any>(null);
  const { toast } = useToast();

  const handlePreview = async () => {
    try {
      setIsLoading(true);
      setStatusMessage("Previewing data from wger...");

      const preview = await previewWgerExercises();
      setPreviewData(preview);

      toast({
        title: "Preview successful",
        description: `Found ${preview.totalCount} exercises in the wger repository`,
      });

      console.log("wger exercise preview:", preview);
      setStatusMessage(`Found ${preview.totalCount} exercises ready to import`);
    } catch (error: any) {
      toast({
        title: "Preview failed",
        description: error.message || "Failed to preview data from wger",
        variant: "destructive",
      });
      setStatusMessage("Preview failed. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setIsLoading(true);
      setProgress(0);
      setStatusMessage("Starting import...");

      await importWgerExercises((message, progressValue) => {
        setStatusMessage(message);
        setProgress(progressValue);
      });

      toast({
        title: "Import successful",
        description: "Exercises from wger have been imported",
      });
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import data from wger",
        variant: "destructive",
      });
      setStatusMessage("Import failed. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Import wger Exercise Data</CardTitle>
        <CardDescription>
          Transfer exercise data from the wger open source project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-md bg-muted/20">
          <h3 className="text-sm font-medium mb-2">wger Repository</h3>
          <p className="text-sm text-muted-foreground">
            This importer will fetch exercise data from the wger-project/wger GitHub repository, 
            including exercises, categories, muscles, and equipment.
          </p>
        </div>

        {previewData && (
          <div className="p-4 border rounded-md bg-muted/10 max-h-60 overflow-y-auto">
            <h3 className="text-sm font-medium mb-2">Data Preview (Sample of exercises)</h3>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(previewData.sample, null, 2)}
            </pre>
          </div>
        )}

        {isLoading && (
          <div className="space-y-2">
            <div className="text-sm">{statusMessage}</div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {!isLoading && statusMessage && (
          <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
            {statusMessage}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreview}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Preview Data"
          )}
        </Button>
        <Button onClick={handleImport} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <><Database className="mr-2 h-4 w-4" /> Import Data</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WgerImporter;
