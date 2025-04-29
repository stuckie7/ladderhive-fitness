
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
import { AlertCircle, RefreshCw, Database, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export interface ExercisesFullTableProps {
  initialSortField?: string;
  initialSortOrder?: 'asc' | 'desc';
}

const ExercisesFullTable = () => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [exercises, setExercises] = useState<ExerciseFull[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { fetchExercisesFull, isLoading, checkTableExists } = useExercisesFull();
  
  // Use a memoized exercise list to prevent re-renders
  const renderedExercises = React.useMemo(() => {
    return exercises;
  }, [exercises]);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        setFetchError(null);
        
        // Check if the table exists
        const exists = await checkTableExists();
        setTableExists(exists);
        
        if (!exists) {
          setFetchError("The 'exercises_full' table does not exist in your Supabase database.");
          return;
        }
        
        // Try to fetch exercises
        const data = await fetchExercisesFull(10, 0);
        
        // Store debug info about the query
        setDebugInfo({
          timestamp: new Date().toISOString(),
          result: data ? 'Data found' : 'No data found',
          count: data?.length || 0
        });
        
        if (data && data.length > 0) {
          setExercises(data);
        } else {
          setFetchError("No exercises found in the database. The exercises_full table may be empty.");
        }
      } catch (error: any) {
        console.error("Error loading exercises:", error);
        setFetchError(`Failed to load exercise data: ${error.message || 'Unknown error'}`);
        setDebugInfo({
          error: error.message,
          details: error.details || 'No additional details'
        });
      }
    };
    
    loadExercises();
  }, [fetchExercisesFull, checkTableExists, retryCount]);

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

  const handleDirectCheckData = async () => {
    try {
      // Direct query to check any data in the table
      const { data, error, count } = await supabase
        .from('exercises_full')
        .select('*', { count: 'exact' })
        .limit(1);
        
      if (error) {
        setDebugInfo({
          directQuery: 'Failed',
          error: error.message,
          code: error.code
        });
      } else {
        setDebugInfo({
          directQuery: 'Success',
          rowCount: count,
          firstRowSample: data && data.length > 0 ? data[0] : 'No rows found',
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setDebugInfo({
        directQuery: 'Exception',
        error: err.message
      });
    }
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
            <AlertTitle>Database Error</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>{fetchError}</p>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm">
                <h4 className="font-semibold mb-2">Debug Information:</h4>
                <p>Table exists check: {tableExists === null ? "Unknown" : tableExists ? "Yes" : "No"}</p>
                {debugInfo && (
                  <pre className="text-xs mt-2 p-2 bg-background overflow-auto max-h-32">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                )}
              </div>
              
              <div>
                <p className="text-sm mt-2 mb-3">Possible solutions:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Create the 'exercises_full' table in your Supabase project</li>
                  <li>Import your exercise data using the Supabase CSV import feature</li>
                  <li>Check your RLS policies to ensure anonymous access is allowed</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button 
                  onClick={handleRetry}
                  className="flex items-center"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry loading data
                </Button>
                
                <Button 
                  onClick={handleDirectCheckData}
                  className="flex items-center"
                  variant="outline"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Debug table data
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex items-center"
                  onClick={() => window.open('https://supabase.com/dashboard/project/jrwyptpespjvjisrwnbh/editor', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Supabase SQL Editor
                </Button>
              </div>
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
