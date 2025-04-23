
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useExercisesFull } from "@/hooks/use-exercises-full";
import { ExerciseFull } from "@/types/exercise";

export interface ExercisesFullTableProps {
  initialSortField?: string;
  initialSortOrder?: 'asc' | 'desc';
}

const ExercisesFullTable = () => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [exercises, setExercises] = useState<ExerciseFull[]>([]);
  const { fetchExercisesFull, isLoading } = useExercisesFull();

  useEffect(() => {
    const loadExercises = async () => {
      const data = await fetchExercisesFull(10, 0);
      // Explicit casting to ensure type compatibility
      setExercises(data as unknown as ExerciseFull[]);
    };
    loadExercises();
  }, [fetchExercisesFull]);

  const onCheckboxChange = (exerciseId: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked
        ? [...prev, exerciseId]
        : prev.filter((id) => id !== exerciseId)
    );
  };

  if (isLoading) {
    return <div className="text-muted-foreground py-8">Loading Supabase exercises_full ...</div>;
  }

  return (
    <Card className="mt-12 p-6">
      <h2 className="text-lg font-bold mb-4">Raw Data: exercises_full (first 10 rows)</h2>
      <div className="mb-2 text-sm text-muted-foreground">
        Selected {selectedIds.length} exercise{selectedIds.length === 1 ? "" : "s"}
      </div>
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
            {exercises.map((ex) => (
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
                    <Badge>{ex.target_muscle_group}</Badge>
                  ) : "-"}
                </TableCell>
                <TableCell>{ex.difficulty}</TableCell>
                <TableCell>{ex.primary_equipment}</TableCell>
                <TableCell>{ex.body_region}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="text-xs text-muted-foreground mt-4">
        Showing the first 10 rows for debugging/demo. Data is from Supabase exercises_full.
      </div>
    </Card>
  );
};

export default ExercisesFullTable;
