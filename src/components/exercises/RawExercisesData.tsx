// src/components/exercises/RawExercisesData.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export function RawExercisesData() {
  const [exerciseData, setExerciseData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRawExerciseData() {
      try {
        setIsLoading(true);
        
        // Query the exercises_full table
        const { data, error } = await supabase
          .from('exercises_full')
          .select('*')
          .limit(10);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setExerciseData(data);
        }
      } catch (err: any) {
        console.error("Error fetching raw exercise data:", err);
        setError(err.message || "Failed to load exercise data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRawExerciseData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Raw Data: exercises_full (first 10 rows)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Raw Data: exercises_full (first 10 rows)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!exerciseData || exerciseData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Raw Data: exercises_full (first 10 rows)</CardTitle>
        </CardHeader>
        <CardContent>
          <div>No exercise data available. Make sure your CSV has been imported to Supabase.</div>
        </CardContent>
      </Card>
    );
  }

  // Get table headers dynamically from the first exercise object
  const headers = Object.keys(exerciseData[0]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raw Data: exercises_full (first 10 rows)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {exerciseData.map((exercise, index) => (
                <TableRow key={index}>
                  {headers.map((header) => (
                    <TableCell key={`${index}-${header}`}>
                      {exercise[header]?.toString() || ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
