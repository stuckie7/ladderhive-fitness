
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { Slider } from "@/components/ui/slider";

const OnboardingForm = () => {
  const [activeTab, setActiveTab] = useState("basics");
  const [height, setHeight] = useState(175); // in cm
  const [weight, setWeight] = useState(70); // in kg
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState("not-selected"); 
  const [fitnessLevel, setFitnessLevel] = useState("");
  const [fitnessGoals, setFitnessGoals] = useState<string[]>([]);
  const [workoutDays, setWorkoutDays] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddGoal = (goal: string) => {
    if (fitnessGoals.includes(goal)) {
      setFitnessGoals(fitnessGoals.filter(g => g !== goal));
    } else {
      setFitnessGoals([...fitnessGoals, goal]);
    }
  };

  const handleAddWorkoutDay = (day: string) => {
    if (workoutDays.includes(day)) {
      setWorkoutDays(workoutDays.filter(d => d !== day));
    } else {
      setWorkoutDays([...workoutDays, day]);
    }
  };

  const handleContinue = () => {
    if (activeTab === "basics" && (!height || !weight || !age || !gender)) {
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
    setIsLoading(true);
    
    try {
      // Mock saving user profile data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get existing user data from localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      
      // Update with profile data
      const updatedUserData = {
        ...userData,
        profile: {
          height,
          weight,
          age,
          gender,
          fitnessLevel,
          fitnessGoals,
          workoutDays
        }
      };
      
      // Save updated user data
      localStorage.setItem("user", JSON.stringify(updatedUserData));
      
      toast({
        title: "Profile setup complete",
        description: "Your fitness profile has been created!",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Set Up Your Profile</CardTitle>
        <CardDescription>Tell us about yourself to personalize your experience</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="fitness">Fitness</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basics" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min={100}
                max={250}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                min={30}
                max={250}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                min={16}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-selected">Select gender</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
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
                      fitnessLevel === level.toLowerCase() ? "bg-fitness-primary" : ""
                    }`}
                    onClick={() => setFitnessLevel(level.toLowerCase())}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-4">
            <div className="space-y-2">
              <Label>Fitness Goals (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {[
                  "Build Muscle", 
                  "Lose Weight", 
                  "Increase Strength", 
                  "Improve Endurance",
                  "Athletic Performance",
                  "General Fitness"
                ].map((goal) => (
                  <Button
                    key={goal}
                    type="button"
                    variant="outline"
                    className={`${
                      fitnessGoals.includes(goal.toLowerCase()) 
                        ? "bg-fitness-primary text-white border-fitness-primary" 
                        : ""
                    }`}
                    onClick={() => handleAddGoal(goal.toLowerCase())}
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <div className="space-y-2">
              <Label>Workout Days</Label>
              <div className="grid grid-cols-7 gap-2 pt-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant="outline"
                    className={`${
                      workoutDays.includes(day.toLowerCase()) 
                        ? "bg-fitness-primary text-white border-fitness-primary" 
                        : ""
                    }`}
                    onClick={() => handleAddWorkoutDay(day.toLowerCase())}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2 pt-4">
              <Label>Workout Duration (minutes per session)</Label>
              <Slider 
                defaultValue={[45]} 
                max={120} 
                min={15} 
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>15 min</span>
                <span>45 min</span>
                <span>120 min</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {activeTab !== "basics" && (
          <Button 
            variant="outline" 
            onClick={() => {
              if (activeTab === "fitness") setActiveTab("basics");
              else if (activeTab === "goals") setActiveTab("fitness");
              else if (activeTab === "schedule") setActiveTab("goals");
            }}
          >
            Back
          </Button>
        )}
        <div className="flex-1"></div>
        <Button 
          onClick={handleContinue}
          className="bg-fitness-primary hover:bg-fitness-primary/90"
          disabled={isLoading}
        >
          {activeTab === "schedule" 
            ? (isLoading ? "Saving..." : "Complete Setup") 
            : "Continue"
          }
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OnboardingForm;
