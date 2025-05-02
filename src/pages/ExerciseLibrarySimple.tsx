
import React from "react";
import { useExercises } from '@/hooks/useExercises';
import { Video, Plus } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";

export default function ExerciseLibrarySimple() {
  const { exercises, loading, error, page, setPage, itemsPerPage } = useExercises();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Exercise Library (Simple)</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner />
            <span className="ml-2">Loading exercises...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-500 rounded-md">
            Error: {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {exercises.map((exercise) => (
                <div key={exercise.id} className="bg-card rounded-lg shadow overflow-hidden border">
                  <div className="bg-muted aspect-video flex items-center justify-center">
                    {exercise.short_youtube_demo ? (
                      <a 
                        href={exercise.short_youtube_demo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center h-full w-full bg-black/10 hover:bg-black/20 transition-colors"
                      >
                        <Video size={36} className="text-primary" />
                      </a>
                    ) : (
                      <div className="text-muted-foreground opacity-40">
                        <Video size={36} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{exercise.name || 'Untitled Exercise'}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {exercise.prime_mover_muscle && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-300">
                          {exercise.prime_mover_muscle}
                        </span>
                      )}
                      {exercise.primary_equipment && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded dark:bg-green-900 dark:text-green-300">
                          {exercise.primary_equipment}
                        </span>
                      )}
                      {exercise.difficulty && (
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded dark:bg-amber-900 dark:text-amber-300">
                          {exercise.difficulty}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex justify-between">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 flex items-center">
                        <Video className="mr-1" size={16} />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 flex items-center">
                        <Plus className="mr-1" size={16} />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline" 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="px-4 py-2 flex items-center">Page {page + 1}</span>
              <Button
                variant="outline" 
                onClick={() => setPage(p => p + 1)}
                disabled={exercises.length < itemsPerPage}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
