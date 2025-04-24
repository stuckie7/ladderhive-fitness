
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
        const data = await fetchExercisesFull(10, 0);
        if (data && data.length > 0) {
          // Cast to ensure type compatibility
          setExercises(data);
          setFetchError(null);
        } else if (retryCount < 2) {
          // Try up to 3 times (initial + 2 retries)
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1500); // Retry after 1.5 seconds
        } else {
          setFetchError("Unable to load exercise data. Please check your connection.");
        }
      } catch (error) {
        console.error("Error loading exercises:", error);
        setFetchError("Failed to load exercise data.");
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

  if (isLoading && exercises.length === 0) {
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
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              {fetchError}<br />
              <button 
                onClick={() => setRetryCount(prev => prev + 1)}
                className="text-sm font-medium underline hover:text-primary mt-2"
              >
                Retry loading data
              </button>
            </AlertDescription>
          </Alert>
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
              {renderedExercises.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No exercise data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExercisesFullTable;
