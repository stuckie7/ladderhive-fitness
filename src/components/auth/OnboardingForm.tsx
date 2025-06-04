
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type FitnessGoal = 'build-muscle' | 'lose-weight' | 'strength' | 'endurance' | 'athletic' | 'general';
type WorkoutDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const OnboardingForm = () => {
  const [activeTab, setActiveTab] = useState("basics");
  const [heightFeet, setHeightFeet] = useState<number | undefined>(undefined); 
  const [heightInches, setHeightInches] = useState<number | undefined>(undefined);
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [age, setAge] = useState<number | undefined>(undefined);
  const [gender, setGender] = useState<string>("");
  const [fitnessLevel, setFitnessLevel] = useState<string>("");
  const [fitnessGoals, setFitnessGoals] = useState<FitnessGoal[]>([]);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  
  // Body measurements (optional)
  const [neck, setNeck] = useState<number | undefined>(undefined);
  const [chest, setChest] = useState<number | undefined>(undefined);
  const [waist, setWaist] = useState<number | undefined>(undefined);
  const [hips, setHips] = useState<number | undefined>(undefined);
  
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAddGoal = (goal: FitnessGoal) => {
    setFitnessGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal) 
        : [...prev, goal]
    );
  };

  const handleAddWorkoutDay = (day: WorkoutDay) => {
    setWorkoutDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  const convertHeightToCm = (): number => {
    const feet = heightFeet || 0;
    const inches = heightInches || 0;
    return Math.round((feet * 30.48) + (inches * 2.54));
  };

  const convertWeightToKg = (): number => {
    return Math.round((weight || 0) * 0.453592);
  };

  const handleContinue = () => {
    if (activeTab === "basics" && (!heightFeet || !heightInches || !weight || !age || !gender)) {
      toast({
        title: "Missing information",
        description: "Please fill in all the required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (activeTab === "fitness" && !fitnessLevel) {
      toast({
        title: "Missing information",
        description: "Please select your fitness level.",
        variant: "destructive",
      });
      return;
    }
    
    if (activeTab === "goals" && fitnessGoals.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one fitness goal.",
        variant: "destructive",
      });
      return;
    }
    
    if (activeTab === "schedule" && workoutDays.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one workout day.",
        variant: "destructive",
      });
      return;
    }
    
    if (activeTab === "basics") setActiveTab("fitness");
    else if (activeTab === "fitness") setActiveTab("goals");
    else if (activeTab === "goals") setActiveTab("schedule");
    else if (activeTab === "schedule") handleSubmit();
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const profileData: any = {
        height: convertHeightToCm(),
        weight: convertWeightToKg(),
        age,
        gender,
        fitness_level: fitnessLevel,
        fitness_goals: fitnessGoals,
        workout_days: workoutDays,
        updated_at: new Date().toISOString()
      };

      // Add body measurements if provided
      if (neck) profileData.neck = neck;
      if (chest) profileData.chest = chest;
      if (waist) profileData.waist = waist;
      if (hips) profileData.hips = hips;

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile setup complete",
        description: "Your fitness profile has been created!",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was an error saving your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-2xl font-bold text-foreground">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {activeTab === "basics" && "Tell us about yourself"}
            {activeTab === "fitness" && "What's your fitness level?"}
            {activeTab === "goals" && "What are your fitness goals?"}
            {activeTab === "schedule" && "When do you want to work out?"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 py-4">
          <TabsList className="w-full grid grid-cols-4 mb-6 bg-muted/50">
            <TabsTrigger value="basics" className="py-2 text-xs md:text-sm">Basics</TabsTrigger>
            <TabsTrigger value="fitness" className="py-2 text-xs md:text-sm">Fitness</TabsTrigger>
            <TabsTrigger value="goals" className="py-2 text-xs md:text-sm">Goals</TabsTrigger>
            <TabsTrigger value="schedule" className="py-2 text-xs md:text-sm">Schedule</TabsTrigger>
          </TabsList>
          
          <div className="space-y-6">
            {/* Basics Tab */}
            <TabsContent value="basics" className="space-y-4">
              <div className="space-y-2">
                <Label>Height</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="heightFeet" className="text-xs text-muted-foreground">Feet</Label>
                    <Input
                      id="heightFeet"
                      type="number"
                      value={heightFeet || ''}
                      onChange={(e) => setHeightFeet(e.target.value ? Number(e.target.value) : undefined)}
                      min={1}
                      max={8}
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="heightInches" className="text-xs text-muted-foreground">Inches</Label>
                    <Input
                      id="heightInches"
                      type="number"
                      value={heightInches || ''}
                      onChange={(e) => setHeightInches(e.target.value ? Number(e.target.value) : undefined)}
                      min={0}
                      max={11}
                      placeholder=""
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight || ''}
                  onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)}
                  min={50}
                  max={500}
                  placeholder=""
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age || ''}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)}
                  min={16}
                  max={100}
                  placeholder=""
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            {/* Fitness Level Tab */}
            <TabsContent value="fitness" className="space-y-4">
              <div className="space-y-2">
                <Label>Fitness Level</Label>
                <div className="space-y-2 pt-2">
                  {["Beginner", "Intermediate", "Advanced", "Elite"].map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={fitnessLevel === level.toLowerCase() ? "default" : "outline"}
                      className={`w-full justify-start ${
                        fitnessLevel === level.toLowerCase() ? "bg-primary" : ""
                      }`}
                      onClick={() => setFitnessLevel(level.toLowerCase())}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Body Measurements Section (Optional) */}
              <div className="space-y-4 mt-6 pt-6 border-t border-border">
                <div className="space-y-2">
                  <Label className="text-base">Body Measurements (Optional)</Label>
                  <p className="text-sm text-muted-foreground">These measurements are optional and can help track your progress</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="neck" className="text-xs text-muted-foreground">Neck (inches)</Label>
                    <Input
                      id="neck"
                      type="number"
                      value={neck || ''}
                      onChange={(e) => setNeck(e.target.value ? Number(e.target.value) : undefined)}
                      min={8}
                      max={30}
                      step="0.5"
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="chest" className="text-xs text-muted-foreground">Chest (inches)</Label>
                    <Input
                      id="chest"
                      type="number"
                      value={chest || ''}
                      onChange={(e) => setChest(e.target.value ? Number(e.target.value) : undefined)}
                      min={20}
                      max={70}
                      step="0.5"
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="waist" className="text-xs text-muted-foreground">Waist (inches)</Label>
                    <Input
                      id="waist"
                      type="number"
                      value={waist || ''}
                      onChange={(e) => setWaist(e.target.value ? Number(e.target.value) : undefined)}
                      min={15}
                      max={60}
                      step="0.5"
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="hips" className="text-xs text-muted-foreground">Hips (inches)</Label>
                    <Input
                      id="hips"
                      type="number"
                      value={hips || ''}
                      onChange={(e) => setHips(e.target.value ? Number(e.target.value) : undefined)}
                      min={20}
                      max={70}
                      step="0.5"
                      placeholder=""
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-4">
              <div className="space-y-4">
                <Label className="text-base">Fitness Goals</Label>
                <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "build-muscle" as const, label: "Build Muscle" },
                    { id: "lose-weight" as const, label: "Lose Weight" },
                    { id: "strength" as const, label: "Increase Strength" },
                    { id: "endurance" as const, label: "Improve Endurance" },
                    { id: "athletic" as const, label: "Athletic Performance" },
                    { id: "general" as const, label: "General Fitness" }
                  ].map((goal) => (
                    <Button
                      key={goal.id}
                      type="button"
                      variant={fitnessGoals.includes(goal.id) ? "default" : "outline"}
                      className={`h-auto py-3 whitespace-normal text-left ${
                        fitnessGoals.includes(goal.id) ? "bg-primary" : ""
                      }`}
                      onClick={() => handleAddGoal(goal.id)}
                    >
                      {goal.label}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4">
              <div className="space-y-4">
                <Label className="text-base">Preferred Workout Days</Label>
                <p className="text-sm text-muted-foreground mb-4">Select your regular workout days</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: "monday" as const, label: "Monday" },
                    { id: "tuesday" as const, label: "Tuesday" },
                    { id: "wednesday" as const, label: "Wednesday" },
                    { id: "thursday" as const, label: "Thursday" },
                    { id: "friday" as const, label: "Friday" },
                    { id: "saturday" as const, label: "Saturday" },
                    { id: "sunday" as const, label: "Sunday" }
                  ].map((day) => (
                    <Button
                      key={day.id}
                      type="button"
                      variant={workoutDays.includes(day.id) ? "default" : "outline"}
                      className={`h-auto py-3 whitespace-normal ${
                        workoutDays.includes(day.id) ? "bg-primary" : ""
                      }`}
                      onClick={() => handleAddWorkoutDay(day.id)}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (activeTab === "fitness") setActiveTab("basics");
                  else if (activeTab === "goals") setActiveTab("fitness");
                  else if (activeTab === "schedule") setActiveTab("goals");
                }}
                disabled={activeTab === "basics"}
                className="min-w-[100px]"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={isLoading}
                className="min-w-[100px] bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : activeTab === "schedule" ? (
                  "Finish"
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default OnboardingForm;
