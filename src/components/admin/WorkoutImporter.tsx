
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { importWorkoutsFromGithub, previewWorkoutsFromGithub } from "@/services/workoutDataImporter";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download, Database } from "lucide-react";

const WorkoutImporter = () => {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [workoutsPath, setWorkoutsPath] = useState("data/workouts.json");
  const [exercisesPath, setExercisesPath] = useState("data/exercises.json");
  const [branch, setBranch] = useState("main");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Import Workout Data from GitHub</CardTitle>
        <CardDescription>
          Transfer workout data from a GitHub repository to your app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardFooter>
    </Card>
  );
};

export default WorkoutImporter;
