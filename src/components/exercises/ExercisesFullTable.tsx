
import React, { useEffect, useState } from "react";
import { useExercisesFull, ExerciseFull } from "@/hooks/use-exercises-full";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ExercisesFullTable = () => {
  const [exercises, setExercises] = useState<ExerciseFull[]>([]);
  const { fetchExercisesFull, isLoading } = useExercisesFull();

  useEffect(() => {
    fetchExercisesFull(10, 0).then(setExercises);
  }, []);

  if (isLoading) {
    return <div className="text-muted-foreground py-8">Loading Supabase exercises_full ...</div>;
  }

  return (
    <Card className="mt-12 p-6">
      <h2 className="text-lg font-bold mb-4">Raw Data: exercises_full (first 10 rows)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr>
              <th className="border px-1">ID</th>
              <th className="border px-1">Name</th>
              <th className="border px-1">Target Muscle</th>
              <th className="border px-1">Difficulty</th>
              <th className="border px-1">Equipment</th>
              <th className="border px-1">Body Region</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((ex) => (
              <tr key={ex.id}>
                <td className="border px-1">{ex.id}</td>
                <td className="border px-1">{ex.name}</td>
                <td className="border px-1">
                  {ex.target_muscle_group ? <Badge>{ex.target_muscle_group}</Badge> : "-"}
                </td>
                <td className="border px-1">{ex.difficulty}</td>
                <td className="border px-1">{ex.primary_equipment}</td>
                <td className="border px-1">{ex.body_region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted-foreground mt-4">
        Showing the first 10 rows for debugging/demo. Data is from Supabase exercises_full.
      </div>
    </Card>
  );
};

export default ExercisesFullTable;
