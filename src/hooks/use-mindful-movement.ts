
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface MindfulMovement {
  id: string;
  title: string;
  description: string;
  duration: string;
  intensity: string;
  timeNeeded: string;
  stressType: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export const useGetMindfulMovement = () => {
  const [workouts, setWorkouts] = useState<MindfulMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [intensityFilter, setIntensityFilter] = useState<string | null>(null);
  const [stressTypeFilter, setStressTypeFilter] = useState<string | null>(null);
  const { toast } = useToast();
  
  // These would typically come from your database
  const moodOptions = {
    time: ["quick", "medium", "extended"],
    intensity: ["gentle", "moderate", "vigorous"],
    stressType: ["anxiety", "focus", "energy", "sleep", "relaxation"]
  };
  
  // Mock data - this would be replaced with data from your Supabase table
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockWorkouts: MindfulMovement[] = [
          {
            id: "1",
            title: "Morning Mindfulness Flow",
            description: "Start your day with this gentle sequence designed to awaken your body and calm your mind.",
            duration: "15 mins",
            intensity: "gentle",
            timeNeeded: "quick",
            stressType: "anxiety",
            thumbnailUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          },
          {
            id: "2",
            title: "Desk Break Stretches",
            description: "Take a quick break from work to reset your posture and reduce tension with these simple movements.",
            duration: "5 mins",
            intensity: "gentle",
            timeNeeded: "quick",
            stressType: "focus",
            thumbnailUrl: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&q=80&w=1000",
          },
          {
            id: "3",
            title: "Energy Boost Flow",
            description: "This moderate sequence will help you shake off lethargy and restore your energy levels.",
            duration: "20 mins",
            intensity: "moderate",
            timeNeeded: "medium",
            stressType: "energy",
            thumbnailUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=1000",
          },
          {
            id: "4",
            title: "Bedtime Wind-Down",
            description: "Prepare your body and mind for sleep with this gentle sequence of calming movements.",
            duration: "10 mins",
            intensity: "gentle",
            timeNeeded: "quick",
            stressType: "sleep",
            thumbnailUrl: "https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80&w=1000",
          },
          {
            id: "5",
            title: "Deep Relaxation Practice",
            description: "Release tension from your entire body with this comprehensive relaxation sequence.",
            duration: "30 mins",
            intensity: "gentle",
            timeNeeded: "extended",
            stressType: "relaxation",
            thumbnailUrl: "https://images.unsplash.com/photo-1470137233282-5de094429b8f?auto=format&fit=crop&q=80&w=1000",
          }
        ];
        
        // Apply filters
        let filtered = [...mockWorkouts];
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(workout => 
            workout.title.toLowerCase().includes(query) || 
            workout.description.toLowerCase().includes(query)
          );
        }
        
        if (timeFilter) {
          filtered = filtered.filter(workout => 
            workout.timeNeeded.toLowerCase() === timeFilter.toLowerCase()
          );
        }
        
        if (intensityFilter) {
          filtered = filtered.filter(workout => 
            workout.intensity.toLowerCase() === intensityFilter.toLowerCase()
          );
        }
        
        if (stressTypeFilter) {
          filtered = filtered.filter(workout => 
            workout.stressType.toLowerCase() === stressTypeFilter.toLowerCase()
          );
        }
        
        setWorkouts(filtered);
      } catch (err: any) {
        console.error("Error fetching mindful movement data:", err);
        setError(err);
        toast({
          title: "Error",
          description: "Failed to load mindful movement practices",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [searchQuery, timeFilter, intensityFilter, stressTypeFilter, toast]);
  
  return {
    workouts,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    timeFilter,
    setTimeFilter,
    intensityFilter,
    setIntensityFilter,
    stressTypeFilter,
    setStressTypeFilter,
    moodOptions
  };
};
