
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import ExerciseCardFull from "./ExerciseCardFull";
import { ExerciseFull } from "@/types/exercise";
import RawExercisesData from "./RawExercisesData";

const ExercisesFullDataCards = () => {
  const [exercises, setExercises] = useState<ExerciseFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch count first
        const { count, error: countError } = await supabase
          .from('exercises_full')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          throw countError;
        }
        
        if (count !== null) {
          setTotalCount(count);
        }
        
        // Then fetch actual data
const { data, error } = await supabase
  .from('exercises_full')
  .select(`
    id,
    name,
    prime_mover_muscle,
    mechanics,
    difficulty,
    primary_equipment,
    short_youtube_demo,
    in_depth_youtube_exp,
    youtube_thumbnail_url,
    secondary_muscle,
    tertiary_muscle,
    primary_items_count,
    secondary_equipment,
    secondary_items_count,
    posture,
    single_or_double_arm,
    arm_movement_pattern,
    grip,
    load_position,
    leg_movement_pattern,
    foot_elevation,
    combination_exercise,
    movement_pattern_1,
    movement_pattern_2,
    movement_pattern_3,
    plane_of_motion_1,
    plane_of_motion_2,
    plane_of_motion_3,
    body_region,
    force_type,
    mechanics,
    laterality,
    exercise_classification,
    created_at,
    updated_at
  `)
  .range(page * itemsPerPage, (page + 1) * itemsPerPage - 1)
  .order('name');

          
        if (error) {
          throw error;
        }
        
        // Map the data to include required fields for ExerciseFull
        const mappedData = data?.map(item => ({
          ...item,
          target_muscle_group: item.prime_mover_muscle || null,
          video_demonstration_url: item.short_youtube_demo || null,
          video_explanation_url: item.in_depth_youtube_exp || null
        })) || [];
        
        setExercises(mappedData);
      } catch (err: any) {
        console.error("Error fetching exercises:", err);
        setError(err.message || "Failed to fetch exercises");
      } finally {
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, [page]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Debug section for raw data */}
      <div className="mb-10">
        <RawExercisesData />
      </div>
      
      {/* Exercise cards grid */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Exercise Cards</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner />
            <span className="ml-2">Loading exercises...</span>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-red-500">
                <h3 className="font-semibold mb-2">Error Loading Exercises</h3>
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {exercises.map((exercise) => (
                <ExerciseCardFull key={exercise.id} exercise={exercise} />
              ))}
            </div>
            
            {totalCount > 0 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(0, page - 1))}
                        className={page === 0 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        // Show all pages if 5 or fewer
                        pageNum = i;
                      } else if (page < 3) {
                        // Near the start
                        pageNum = i;
                      } else if (page > totalPages - 4) {
                        // Near the end
                        pageNum = totalPages - 5 + i;
                      } else {
                        // In the middle
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink 
                            isActive={page === pageNum}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum + 1}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(page + 1)}
                        className={page >= totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                
                <div className="mt-2 text-center text-sm text-muted-foreground">
                  Showing {page * itemsPerPage + 1}-{Math.min((page + 1) * itemsPerPage, totalCount)} of {totalCount} exercises
                </div>
              </div>
            )}
            
            {exercises.length === 0 && !loading && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No exercises found</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
      
      {/* Link to other exercise views */}
      <div className="flex justify-center space-x-4 mt-10 mb-6">
        <Button variant="outline" onClick={() => window.location.href = "/exercises"}>
          Go to Advanced Exercise Library
        </Button>
        <Button variant="outline" onClick={() => window.location.href = "/exercises-simple"}>
          Go to Simple Exercise View
        </Button>
      </div>
    </div>
  );
};

export default ExercisesFullDataCards;
