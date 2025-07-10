
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Wod } from '@/types/wod';
import { useTemplateManagement } from '@/hooks/workout-builder/use-template-management';
import { useToast } from '@/components/ui/use-toast';

interface StartWodButtonProps {
  wod: Wod;
  showIcon?: boolean;
}

const StartWodButton: React.FC<StartWodButtonProps> = ({ wod, showIcon = true }) => {
  const navigate = useNavigate();
  // const { loadTemplateFromWod } = useTemplateManagement();
  const { toast } = useToast();
  
  const handleStartWorkout = async () => {
    try {
      navigate(`/workout-player/${wod.id}`);
    } catch (error) {
      console.error("Error starting workout:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      
      // fallback – remain on same page
    }
  };
  
  return (
    <Button 
      className="bg-primary"
      onClick={handleStartWorkout}
    >
      {showIcon && <Play className="mr-2 h-4 w-4" />}
      Start This WOD
    </Button>
  );
};

export default StartWodButton;
