import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { InfoIcon } from "lucide-react";
import { ExerciseFull } from "@/types/exercise";

const COLUMNS_TO_SHOW = [
  'name',
  'difficulty',
  'target_muscle_group',
  'primary_equipment',
  'secondary_equipment',
  'posture',
  'body_region',
  'force_type'
];

export function RawExercisesData() {
  const [exerciseData, setExerciseData] = useState<ExerciseFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRawExerciseData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('exercises_full')
          .select('*')
          .limit(10)
          .order('name', { ascending: true });
        
        if (error) throw error;
        setExerciseData(data || []);
      } catch (err) {
        console.error("Error fetching exercise data:", err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRawExerciseData();
  }, []);

  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (exerciseData.length === 0) return <EmptyState />;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Raw Exercise Data (First 10 Rows)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {COLUMNS_TO_SHOW.map(header => (
                  <TableHead key={header} className="capitalize bg-muted/50">
                    {header.replace(/_/g, ' ')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {exerciseData.map((exercise) => (
                <TableRow key={exercise.id}>
                  {COLUMNS_TO_SHOW.map(header => (
                    <TableCell key={`${exercise.id}-${header}`}>
                      {formatCellValue(exercise[header as keyof ExerciseFull])}
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

// Sub-components for better organization
const LoadingState = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg font-medium">
        Loading Exercise Data...
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </CardContent>
  </Card>
);

const ErrorState = ({ error }: { error: string }) => (
  <Card className="border-red-200">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg font-medium">
        Error Loading Data
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-2 text-red-500">
        <InfoIcon className="h-4 w-4" />
        <span>{error}</span>
      </div>
    </CardContent>
  </Card>
);

const EmptyState = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg font-medium">
        No Data Available
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-2 text-amber-500">
        <InfoIcon className="h-4 w-4" />
        <span>No exercises found in database</span>
      </div>
    </CardContent>
  </Card>
);

export default RawExercisesData;
