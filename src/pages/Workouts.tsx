
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import WorkoutCard from "@/components/workouts/WorkoutCard";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

// Mock workouts data
const mockWorkouts = [
  {
    id: "1",
    title: "Full Body Strength",
    description: "Build strength with this full body workout focusing on compound movements.",
    duration: 45,
    exercises: 8,
    difficulty: "Intermediate"
  },
  {
    id: "2",
    title: "Upper Body Push",
    description: "Focus on chest, shoulders and triceps with this pushing workout.",
    duration: 40,
    exercises: 6,
    difficulty: "Intermediate"
  },
  {
    id: "3",
    title: "Lower Body Strength",
    description: "Build leg strength with this high-intensity lower body workout.",
    duration: 50,
    exercises: 7,
    difficulty: "Advanced"
  },
  {
    id: "4",
    title: "Core Crusher",
    description: "Strengthen your core with this targeted abdominal and lower back workout.",
    duration: 30,
    exercises: 6,
    difficulty: "Beginner"
  },
  {
    id: "5",
    title: "HIIT Cardio",
    description: "Boost your cardiovascular fitness with this high-intensity interval training session.",
    duration: 25,
    exercises: 10,
    difficulty: "Advanced"
  },
  {
    id: "6",
    title: "Mobility Flow",
    description: "Improve your range of motion and joint health with this mobility routine.",
    duration: 35,
    exercises: 8,
    difficulty: "Beginner"
  }
];

// Mock completed workouts
const mockCompletedWorkouts = [
  {
    id: "7",
    title: "Full Body Strength",
    description: "Completed on June 10, 2023",
    duration: 45,
    exercises: 8,
    difficulty: "Intermediate"
  },
  {
    id: "8",
    title: "HIIT Cardio",
    description: "Completed on June 8, 2023",
    duration: 25,
    exercises: 10,
    difficulty: "Advanced"
  },
  {
    id: "9",
    title: "Upper Body Push",
    description: "Completed on June 6, 2023",
    duration: 40,
    exercises: 6,
    difficulty: "Intermediate"
  }
];

const Workouts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  
  const filteredWorkouts = mockWorkouts.filter(workout => {
    // Apply search filter
    if (searchQuery && !workout.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply difficulty filter
    if (difficultyFilter && workout.difficulty.toLowerCase() !== difficultyFilter.toLowerCase()) {
      return false;
    }
    
    // Apply duration filter
    if (durationFilter) {
      const duration = parseInt(durationFilter);
      if (durationFilter === "30" && workout.duration >= 30) {
        return false;
      } else if (durationFilter === "30-45" && (workout.duration < 30 || workout.duration > 45)) {
        return false;
      } else if (durationFilter === "45+" && workout.duration <= 45) {
        return false;
      }
    }
    
    return true;
  });
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search workouts..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[140px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Difficulty</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={durationFilter} onValueChange={setDurationFilter}>
              <SelectTrigger className="w-[140px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Duration</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Duration</SelectItem>
                <SelectItem value="30">&lt; 30 min</SelectItem>
                <SelectItem value="30-45">30-45 min</SelectItem>
                <SelectItem value="45+">&gt; 45 min</SelectItem>
              </SelectContent>
            </Select>
            
            {(searchQuery || difficultyFilter || durationFilter) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setDifficultyFilter("");
                  setDurationFilter("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Workouts</TabsTrigger>
            <TabsTrigger value="my-plan">My Plan</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {filteredWorkouts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No workouts found matching your filters.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setDifficultyFilter("");
                    setDurationFilter("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-plan">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockWorkouts.slice(0, 3).map((workout) => (
                <WorkoutCard 
                  key={workout.id} 
                  workout={{
                    ...workout,
                    date: ["Today", "Tomorrow", "Wed, Jun 12"][parseInt(workout.id) - 1]
                  }} 
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCompletedWorkouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="saved">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockWorkouts.slice(3, 5).map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Workouts;
