
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NutritionItem } from "@/types/nutrition";

interface NutritionResultsProps {
  results: NutritionItem[];
  isLoading: boolean;
}

const NutritionResults = ({ results, isLoading }: NutritionResultsProps) => {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-muted rounded mb-2"></div>
        <div className="h-12 bg-muted rounded mb-2"></div>
        <div className="h-12 bg-muted rounded"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          Search for foods to see nutrition information
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Food</TableHead>
            <TableHead>Serving</TableHead>
            <TableHead>Calories</TableHead>
            <TableHead>Protein</TableHead>
            <TableHead>Carbs</TableHead>
            <TableHead>Fat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((item) => (
            <TableRow key={item.food_name + item.serving_qty}>
              <TableCell className="font-medium">{item.food_name}</TableCell>
              <TableCell>{item.serving_qty} {item.serving_unit}</TableCell>
              <TableCell>{Math.round(item.calories)} kcal</TableCell>
              <TableCell>{item.protein}g</TableCell>
              <TableCell>{item.carbs}g</TableCell>
              <TableCell>{item.fat}g</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default NutritionResults;
