
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { WorkoutTemplate } from "../types";
import { useToast } from "@/components/ui/use-toast";

// Define an explicit interface for the database response to avoid deep type instantiation
interface PreparedWorkoutRecord {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  category: string | null;
  created_at: string;
  is_template: boolean;
  duration_minutes?: number;
  goal?: string;
  thumbnail_url?: string;
  updated_at?: string;
}

export const useTemplateState = () => {
  const [currentTemplate, setCurrentTemplate] = useState<WorkoutTemplate | null>(null);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Add loadTemplates function
  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('is_template', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Cast the data to unknown first, then to our expected type to avoid type errors
      const preparedWorkouts = (data as unknown) as PreparedWorkoutRecord[];
      
      // Map database results to WorkoutTemplate format
      const loadedTemplates: WorkoutTemplate[] = (preparedWorkouts || []).map((template) => ({
        id: template.id,
        name: template.title, // For backward compatibility
        title: template.title,
        description: template.description || "",
        difficulty: template.difficulty || "",
        category: template.category || "",
        created_at: template.created_at,
        exercises: [] // We'll load these separately if needed
      }));
      
      setTemplates(loadedTemplates);
      return loadedTemplates;
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error",
        description: "Failed to load workout templates",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    currentTemplate,
    setCurrentTemplate,
    templates,
    setTemplates,
    isLoading,
    setIsLoading,
    loadTemplates
  };
};
