
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNutritionSearch } from "@/hooks/use-nutrition-search";
import NutritionResults from "./NutritionResults";

const NutritionSearch = () => {
  const [query, setQuery] = useState("");
  const { results, isLoading, search } = useNutritionSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      search(query);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Nutrition Search</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Search for foods (e.g., apple, chicken breast)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-fitness-primary hover:bg-fitness-primary/90"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
        
        <NutritionResults results={results} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};

export default NutritionSearch;
