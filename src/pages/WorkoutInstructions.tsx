
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { generateWorkoutInstructions } from "@/utils/workoutInstructionsGenerator";
import ReactMarkdown from 'react-markdown';

const WorkoutInstructions = () => {
  const [instructions, setInstructions] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInstructions() {
      try {
        setLoading(true);
        const markdownInstructions = await generateWorkoutInstructions();
        setInstructions(markdownInstructions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred loading workout instructions');
        console.error('Error loading workout instructions:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInstructions();
  }, []);

  // Custom renderer for markdown links to open in new tab
  const renderers = {
    a: ({ href, children }: { href?: string, children: React.ReactNode }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        {children}
      </a>
    )
  };

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Workout Instructions</h1>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="pl-4 space-y-2 mt-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Workout Instructions</h1>
        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-6">
            <p className="text-red-600 dark:text-red-400">
              Error loading workout instructions: {error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card>
        <CardContent className="p-6 prose dark:prose-invert max-w-none">
          <ReactMarkdown components={renderers as any}>
            {instructions}
          </ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutInstructions;
