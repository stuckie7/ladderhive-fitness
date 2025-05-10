
import { useCallback } from "react";
import { WorkoutTemplate } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useTemplateLoading = (
  setCurrentTemplate: React.Dispatch<React.SetStateAction<WorkoutTemplate | null>>
) => {
  const { toast } = useToast();

  // Load template from a WOD (Workout of the Day)
  const loadTemplateFromWod = useCallback(async (wodId: string) => {
    try {
      // Fetch the WOD from the database
      const { data: wod, error } = await supabase
        .from('wods')
        .select('*')
        .eq('id', wodId)
        .single();
      
      if (error) throw error;
      
      // Create a template from the WOD
      const template: WorkoutTemplate = {
        id: `wod-template-${Date.now()}`,
        title: wod.name,
        name: wod.name,
        description: wod.description || '',
        exercises: [],
        type: 'wod',
        difficulty: wod.difficulty || 'intermediate',
        duration: wod.avg_duration_minutes || 30,
        created_at: new Date().toISOString(),
        is_template: true,
        source_wod_id: wodId
      };
      
      setCurrentTemplate(template);
      
      toast({
        title: "WOD Template Loaded",
        description: `${wod.name} has been loaded as a template`
      });
      
      return template;
    } catch (error: any) {
      console.error("Error loading WOD as template:", error);
      toast({
        title: "Error",
        description: "Failed to load WOD as template",
        variant: "destructive"
      });
      return null;
    }
  }, [setCurrentTemplate, toast]);

  return { loadTemplateFromWod };
};
