
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useExercisesFull } from "@/hooks/use-exercises-full";
import { ExerciseFull } from "@/types/exercise";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export interface ExercisesFullTableProps {
  initialSortField?: string;
  initialSortOrder?: 'asc' | 'desc';
}

const ExercisesFullTable = () => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [exercises, setExercises] = useState<ExerciseFull[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { fetchExercisesFull, isLoading } = useExercisesFull();
  
  // Use a memoized exercise list to prevent re-renders
  const renderedExercises = React.useMemo(() => {
    return exercises;
  }, [exercises]);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        setFetchError(null);
        const data = await fetchExercisesFull(10, 0);
        if (data && data.length > 0) {
          setExercises(data);
        } else {
          setFetchError("No exercises found in the database. The exercises_full table may be empty.");
          console.log("No data returned from exercise fetch service");
        }
      } catch (error: any) {
        console.error("Error loading exercises:", error);
        setFetchError(`Failed to load exercise data: ${error.message || 'Unknown error'}`);
      }
    };
    
    loadExercises();
  }, [fetchExercisesFull, retryCount]);

  const onCheckboxChange = (exerciseId: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked
        ? [...prev, exerciseId]
        : prev.filter((id) => id !== exerciseId)
    );
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Raw Data: exercises_full</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Loading Supabase exercises_full...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (fetchError) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Raw Data: exercises_full</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Data Error</AlertTitle>
            <AlertDescription className="space-y-4">
              {fetchError}
              <div>
                <p className="text-sm mt-2 mb-3">Possible solutions:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Check that the 'exercises_full' table exists in your Supabase project</li>
                  <li>Verify the table has data and the correct structure</li>
                  <li>Ensure your Supabase connection is working properly</li>
                </ul>
              </div>
              <Button 
                onClick={handleRetry}
                className="mt-4 flex items-center"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry loading data
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!renderedExercises.length) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Raw Data: exercises_full</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No exercise data available</p>
            <Button 
              onClick={handleRetry}
              className="mt-4 flex items-center mx-auto"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry loading data
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Raw Data: exercises_full (first 10 rows)</CardTitle>
        <div className="text-sm text-muted-foreground">
          Selected {selectedIds.length} exercise{selectedIds.length === 1 ? "" : "s"}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Target Muscle</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Body Region</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderedExercises.map((ex) => (
                <TableRow key={ex.id}>
                  <TableCell className="text-center">
                    <Checkbox
                      id={`exercise-${ex.id}`}
                      checked={selectedIds.includes(ex.id)}
                      onCheckedChange={(checked: boolean) =>
                        onCheckboxChange(ex.id, checked)
                      }
                      aria-label={`Select exercise ${ex.name}`}
                    />
                  </TableCell>
                  <TableCell>{ex.id}</TableCell>
                  <TableCell>{ex.name}</TableCell>
                  <TableCell>
                    {ex.target_muscle_group ? (
                      <Badge variant="secondary" className="font-normal">
                        {ex.target_muscle_group}
                      </Badge>
                    ) : "-"}
                  </TableCell>
                  <TableCell>{ex.difficulty || '-'}</TableCell>
                  <TableCell>{ex.primary_equipment || '-'}</TableCell>
                  <TableCell>{ex.body_region || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExercisesFullTable;
