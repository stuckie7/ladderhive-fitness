
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { NutritionItem, NutritionSearchResponse } from "@/types/nutrition";

// Nutritionix API credentials - these should be moved to environment variables in production
const NUTRITIONIX_APP_ID = "3b2cb6dd";
const NUTRITIONIX_API_KEY = "99b351c04c03c390a9d83d9a23f2a732";

export const useNutritionSearch = () => {
  const [results, setResults] = useState<NutritionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const search = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("https://trackapi.nutritionix.com/v2/search/instant", {
        method: "GET",
        headers: {
          "x-app-id": NUTRITIONIX_APP_ID,
          "x-app-key": NUTRITIONIX_API_KEY,
          "Content-Type": "application/json"
        },
        credentials: "omit",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        params: {
          query
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch nutrition data");
      }

      const data: NutritionSearchResponse = await response.json();
      
      // Get nutrition details for each common food item
      const nutritionPromises = data.common.slice(0, 5).map(item => 
        fetch("https://trackapi.nutritionix.com/v2/natural/nutrients", {
          method: "POST",
          headers: {
            "x-app-id": NUTRITIONIX_APP_ID,
            "x-app-key": NUTRITIONIX_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: item.food_name,
            num_servings: item.serving_qty,
            line_delimited: false
          })
        }).then(res => res.json())
      );

      const nutritionResults = await Promise.all(nutritionPromises);
      
      const processedResults: NutritionItem[] = nutritionResults
        .filter(result => result.foods && result.foods.length > 0)
        .map(result => {
          const food = result.foods[0];
          return {
            food_name: food.food_name,
            serving_qty: food.serving_qty,
            serving_unit: food.serving_unit,
            calories: food.nf_calories,
            protein: Math.round(food.nf_protein),
            carbs: Math.round(food.nf_total_carbohydrate),
            fat: Math.round(food.nf_total_fat),
            photo: food.photo
          };
        });

      setResults(processedResults);
    } catch (error) {
      console.error("Error searching for nutrition:", error);
      toast({
        title: "Error",
        description: "Failed to fetch nutrition data. Please try again.",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { results, isLoading, search };
};
