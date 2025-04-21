import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { InfoIcon } from "lucide-react";

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
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            Raw Data: exercises_full (first 10 rows)
          </CardTitle>
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
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            Raw Data: exercises_full (first 10 rows)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500">
            <InfoIcon className="h-4 w-4" />
            <span>Error: {error}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Make sure your Supabase credentials are correct and the table exists.
          </p>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!exerciseData || exerciseData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            Raw Data: exercises_full (first 10 rows)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-amber-500">
            <InfoIcon className="h-4 w-4" />
            <span>No exercise data available</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Make sure your CSV has been imported to Supabase table "exercises_full".
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get table headers dynamically from the first exercise object
  const headers = Object.keys(exerciseData[0]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Raw Data: exercises_full (first 10 rows)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header} className="bg-muted/50">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {exerciseData.map((exercise, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                  {headers.map((header) => (
                    <TableCell key={`${index}-${header}`} className="text-sm">
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

export default RawExercisesData;
