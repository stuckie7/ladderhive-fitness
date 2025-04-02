
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Exercise } from "@/types/exercise";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ExerciseCardProps {
  exercise: Exercise;
  variant?: "card" | "list";
}

const ExerciseCard = ({ exercise, variant = "card" }: ExerciseCardProps) => {
  const {
    id,
    name,
    description,
    difficulty,
    equipment,
    muscle_group,
    image_url,
    gifUrl,
  } = exercise;

  const displayImage = image_url || gifUrl || "/placeholder.svg";
  
  if (variant === "list") {
    return (
      <Link to={`/exercises/${id}`} className="block hover:bg-secondary/10 rounded-lg transition-colors">
        <div className="flex items-center gap-4 p-4">
          <div className="h-16 w-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
            <img 
              src={displayImage} 
              alt={name} 
              className="h-full w-full object-cover" 
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-base truncate">{name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {muscle_group && (
                <Badge variant="outline" className="text-xs">
                  {muscle_group}
                </Badge>
              )}
              {equipment && equipment !== "body weight" && (
                <Badge variant="outline" className="text-xs">
                  {equipment}
                </Badge>
              )}
              {difficulty && (
                <Badge 
                  variant={
                    difficulty === "Beginner" ? "secondary" : 
                    difficulty === "Intermediate" ? "default" : 
                    "destructive"
                  }
                  className="text-xs"
                >
                  {difficulty}
                </Badge>
              )}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
      </Link>
    );
  }
  
  return (
    <Link to={`/exercises/${id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="h-40 bg-muted relative">
          <img 
            src={displayImage} 
            alt={name} 
            className="h-full w-full object-cover" 
          />
          {difficulty && (
            <Badge 
              className="absolute top-2 right-2"
              variant={
                difficulty === "Beginner" ? "secondary" : 
                difficulty === "Intermediate" ? "default" : 
                "destructive"
              }
            >
              {difficulty}
            </Badge>
          )}
        </div>
        <CardHeader className="pb-2">
          <h3 className="font-semibold truncate">{name}</h3>
        </CardHeader>
        <CardContent className="pb-4 flex-1">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description || "No description available."}
          </p>
        </CardContent>
        <CardFooter className="pt-0 flex gap-2 flex-wrap">
          {muscle_group && (
            <Badge variant="outline" className="text-xs">
              {muscle_group}
            </Badge>
          )}
          {equipment && equipment !== "body weight" && (
            <Badge variant="outline" className="text-xs">
              {equipment}
            </Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ExerciseCard;
