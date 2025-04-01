
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Exercise } from "./ExerciseLibrary";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Play, Pause, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ExerciseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchExercise = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from("exercises")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) throw error;
        
        setExercise(data as Exercise);
      } catch (error) {
        console.error("Error fetching exercise:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchExercise();
    }
  }, [id]);
  
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-video bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded"></div>
              <div className="h-4 w-1/4 bg-muted rounded"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-2/3 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (!exercise) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Exercise not found</h1>
          <p className="text-muted-foreground mb-6">The exercise you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/exercises")}>Back to Exercise Library</Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="outline"
          size="sm"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative mb-4">
              {exercise.video_url ? (
                <>
                  <video
                    ref={videoRef}
                    src={exercise.video_url}
                    poster={exercise.image_url || undefined}
                    className="w-full h-full object-cover"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-4 right-4 rounded-full bg-white/80 hover:bg-white text-black border-0"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6 fill-current" />
                    ) : (
                      <Play className="h-6 w-6 fill-current" />
                    )}
                  </Button>
                </>
              ) : exercise.image_url ? (
                <img
                  src={exercise.image_url}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Dumbbell className="h-12 w-12 opacity-20" />
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {exercise.muscle_group && (
                <Badge variant="outline" className="bg-muted/50">
                  {exercise.muscle_group}
                </Badge>
              )}
              {exercise.equipment && (
                <Badge variant="outline" className="bg-muted/50">
                  {exercise.equipment}
                </Badge>
              )}
              {exercise.difficulty && (
                <Badge className={`
                  ${exercise.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                  ${exercise.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                  ${exercise.difficulty === 'Advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : ''}
                `}>
                  {exercise.difficulty}
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-2">{exercise.name}</h1>
            <Tabs defaultValue="instructions" className="mt-6">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="instructions" className="flex-1">Instructions</TabsTrigger>
                <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
              </TabsList>
              
              <TabsContent value="instructions" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How to perform</h3>
                  <p className="text-muted-foreground">
                    {exercise.instructions || "No detailed instructions available for this exercise."}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">Suggested parameters</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Sets</p>
                      <p className="font-medium">3-4</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reps</p>
                      <p className="font-medium">8-12</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rest</p>
                      <p className="font-medium">60-90 seconds</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tempo</p>
                      <p className="font-medium">Controlled</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="about" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">About this exercise</h3>
                  <p className="text-muted-foreground">
                    {exercise.description || "No description available for this exercise."}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">Target muscles</h3>
                  <p className="text-muted-foreground">
                    {exercise.muscle_group || "Not specified"}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Required equipment</h3>
                  <p className="text-muted-foreground">
                    {exercise.equipment || "No equipment needed"}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Related Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              More exercises targeting the same muscle group will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ExerciseDetail;
