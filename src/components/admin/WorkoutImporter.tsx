
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { importWorkoutsFromGithub, previewWorkoutsFromGithub } from "@/services/workoutDataImporter";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download, Database, FolderOpen } from "lucide-react";
import { 
  loadLocalWorkoutCategories, 
  loadLocalTestCategories, 
  loadLocalTestEquipment, 
  loadLocalTestMuscles,
  loadLocalTestExerciseImages,
  loadLocalTestExerciseVideos
} from "@/utils/localDataLoader";

const WorkoutImporter = () => {
  const [activeTab, setActiveTab] = useState("github");
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [workoutsPath, setWorkoutsPath] = useState("data/workouts.json");
  const [exercisesPath, setExercisesPath] = useState("data/exercises.json");
  const [branch, setBranch] = useState("main");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [localDataPreview, setLocalDataPreview] = useState<any>(null);
  const { toast } = useToast();

  const handlePreview = async () => {
    if (!owner || !repo || !workoutsPath) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setStatusMessage("Previewing data from GitHub...");

      const workouts = await previewWorkoutsFromGithub({
        owner,
        repo,
        workoutsPath,
        exercisesPath,
        branch,
      });

      toast({
        title: "Preview successful",
        description: `Found ${workouts.length} workouts in the repository`,
      });

      console.log("Workout data preview:", workouts);
      setStatusMessage(`Found ${workouts.length} workouts ready to import`);
    } catch (error: any) {
      toast({
        title: "Preview failed",
        description: error.message || "Failed to preview data from GitHub",
        variant: "destructive",
      });
      setStatusMessage("Preview failed. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!owner || !repo || !workoutsPath) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setProgress(0);
      setStatusMessage("Starting import...");

      const workouts = await importWorkoutsFromGithub(
        {
          owner,
          repo,
          workoutsPath,
          exercisesPath,
          branch,
        },
        (message, progressValue) => {
          setStatusMessage(message);
          setProgress(progressValue);
        }
      );

      toast({
        title: "Import successful",
        description: `Imported ${workouts.length} workouts`,
      });
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import data from GitHub",
        variant: "destructive",
      });
      setStatusMessage("Import failed. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const previewLocalData = () => {
    setIsLoading(true);
    try {
      const data = {
        categories: loadLocalWorkoutCategories(),
        testCategories: loadLocalTestCategories(),
        testEquipment: loadLocalTestEquipment(),
        testMuscles: loadLocalTestMuscles(),
        testExerciseImages: loadLocalTestExerciseImages(),
        testExerciseVideos: loadLocalTestExerciseVideos(),
      };
      
      setLocalDataPreview(data);
      console.log("Local data preview:", data);
      setStatusMessage(`Found ${Object.keys(data).length} data collections ready to use`);
      
      toast({
        title: "Local data loaded",
        description: "Local JSON files have been loaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Failed to load local data",
        description: error.message || "Could not load local JSON files",
        variant: "destructive",
      });
      setStatusMessage("Loading local data failed. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Import Workout Data</CardTitle>
        <CardDescription>
          Transfer workout data from GitHub or use local JSON files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="github" className="flex-1">GitHub Repository</TabsTrigger>
            <TabsTrigger value="local" className="flex-1">Local JSON Files</TabsTrigger>
          </TabsList>
          
          <TabsContent value="github" className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner">GitHub Username/Organization</Label>
                <Input
                  id="owner"
                  placeholder="e.g., source-org"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repo">Repository Name</Label>
                <Input
                  id="repo"
                  placeholder="e.g., source-repo"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workoutsPath">Workouts File Path</Label>
              <Input
                id="workoutsPath"
                placeholder="e.g., data/workouts.json"
                value={workoutsPath}
                onChange={(e) => setWorkoutsPath(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exercisesPath">Exercises File Path (optional)</Label>
              <Input
                id="exercisesPath"
                placeholder="e.g., data/exercises.json"
                value={exercisesPath}
                onChange={(e) => setExercisesPath(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch (default: main)</Label>
              <Input
                id="branch"
                placeholder="e.g., main"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="local" className="pt-4 space-y-4">
            <div className="p-4 border rounded-md bg-muted/20">
              <h3 className="text-sm font-medium mb-2">Available Local JSON Files</h3>
              <ul className="space-y-1 text-sm">
                <li>• categories.json</li>
                <li>• test-categories.json</li>
                <li>• test-equipment.json</li>
                <li>• test-muscles.json</li>
                <li>• test-exercise-images.json</li>
                <li>• test-exercise-videos.json</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                These files are located in src/components/workouts/
              </p>
            </div>
            
            {localDataPreview && (
              <div className="p-4 border rounded-md bg-muted/10 max-h-60 overflow-y-auto">
                <h3 className="text-sm font-medium mb-2">Data Preview</h3>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(localDataPreview, null, 2)}
                </pre>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {isLoading && (
          <div className="space-y-2">
            <Label htmlFor="progress">{statusMessage}</Label>
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
        {activeTab === "github" ? (
          <>
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Preview Data
            </Button>
            <Button onClick={handleImport} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Database className="mr-2 h-4 w-4" />
              )}
              Import Data
            </Button>
          </>
        ) : (
          <Button 
            onClick={previewLocalData}
            disabled={isLoading}
            className="ml-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FolderOpen className="mr-2 h-4 w-4" />
            )}
            Load Local Data
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WorkoutImporter;
