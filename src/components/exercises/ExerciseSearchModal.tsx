
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Exercise } from "@/types/exercise";
import { useExercises } from "@/hooks/use-exercises";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Command, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface ExerciseSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExercise: (exercise: Exercise) => void;
  workoutId?: string;
}

const ExerciseSearchModal = ({ open, onOpenChange, onAddExercise, workoutId }: ExerciseSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchExercises } = useExercises();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) {
      toast({
        title: "Search query too short",
        description: "Please enter at least 2 characters to search",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchExercises(searchQuery);
      console.log("Search results:", results);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching exercises:", error);
      toast({
        title: "Search failed",
        description: "Failed to search exercises. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    onAddExercise(exercise);
    toast({
      title: "Exercise added",
      description: `${exercise.name} has been added to your workout.`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Search Exercises</DialogTitle>
          <DialogDescription>
            Find exercises to add to your workout
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        <div className="mt-4 h-[300px] overflow-y-auto border rounded-md">
          {searchResults.length > 0 ? (
            <Command>
              <CommandList>
                <CommandGroup heading="Search Results">
                  {searchResults.map((exercise) => (
                    <CommandItem 
                      key={exercise.id}
                      onSelect={() => {}}
                      className="flex justify-between items-center py-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {exercise.muscle_group} • {exercise.equipment}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="ml-2"
                        onClick={() => handleAddExercise(exercise)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
              <CommandEmpty>No exercises found. Try a different search.</CommandEmpty>
            </Command>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Search className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {isSearching ? "Searching..." : "Search for exercises to add to your workout"}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseSearchModal;
