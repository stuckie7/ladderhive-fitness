
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExerciseFull } from "@/types/exercise";

export const useSuggestedExercises = () => {
  const [suggestedExercises, setSuggestedExercises] = useState<ExerciseFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestedExercises = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("exercises_full")
          .select("*")
          .limit(6);

        if (error) {
          throw error;
        }

        // Map the data to ensure it matches ExerciseFull type
        const mappedData: ExerciseFull[] = data.map(exercise => {
          // Create description from available data if missing
          const description = (exercise as any).description || 
            `${exercise.prime_mover_muscle || 'Muscle'} exercise using ${exercise.primary_equipment || 'equipment'}`;
          
          // Create a properly structured ExerciseFull object
          return {
            ...exercise,
            // Add missing required fields
            id: exercise.id,
            name: exercise.name || 'Unknown Exercise',
            target_muscle_group: exercise.prime_mover_muscle || "",
            video_demonstration_url: exercise.short_youtube_demo || "",
            video_explanation_url: exercise.in_depth_youtube_exp || "",
            description,
            image_url: exercise.youtube_thumbnail_url || ""
          } as ExerciseFull;
        });

        setSuggestedExercises(mappedData);
      } catch (error) {
        console.error("Error fetching suggested exercises:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestedExercises();
  }, []);

  return { suggestedExercises, isLoading };
};
