
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { WorkoutTemplate } from "../types";
import { useToast } from "@/components/ui/use-toast";

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
      
      // Map database results to WorkoutTemplate format
      const loadedTemplates: WorkoutTemplate[] = (data || []).map(template => ({
        id: template.id,
        name: template.title, // For backward compatibility
        title: template.title,
        description: template.description || "",
        difficulty: template.difficulty || "",
        category: template.category || "",
        created_at: template.created_at,
        source_wod_id: template.source_wod_id,
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
