
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { NutritionItem, NutritionSearchResponse } from "@/types/nutrition";

// API constants
const NUTRITIONIX_APP_ID = "b22b33fd";
const NUTRITIONIX_API_KEY = "80b0a5b5d0df1f9e7fbda54a95dfd58a";
const API_URL = "https://trackapi.nutritionix.com/v2/search/instant";

export const useNutritionSearch = () => {
  const [results, setResults] = useState<NutritionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const search = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // Create a URL with search params
      const url = new URL(API_URL);
      url.searchParams.append("query", query);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-app-id": NUTRITIONIX_APP_ID,
          "x-app-key": NUTRITIONIX_API_KEY,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const data: NutritionSearchResponse = await response.json();
      
      // Map the response to our NutritionItem type
      const items: NutritionItem[] = data.common.map(item => ({
        food_name: item.food_name,
        serving_qty: item.serving_qty,
        serving_unit: item.serving_unit,
        calories: 0, // The search endpoint doesn't provide nutritional info
        protein: 0,
        carbs: 0,
        fat: 0,
        photo: item.photo
      }));
      
      setResults(items);
    } catch (error: any) {
      console.error("Nutrition search error:", error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to search for nutrition information",
        variant: "destructive",
      });
      
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { results, isLoading, search };
};
