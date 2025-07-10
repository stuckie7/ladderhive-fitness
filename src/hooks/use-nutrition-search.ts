
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { NutritionItem, NutritionSearchResponse } from "@/types/nutrition";

// API constants - commented out as we're deactivating the API calls
// const NUTRITIONIX_APP_ID = "b22b33fd";
// const NUTRITIONIX_API_KEY = "80b0a5b5d0df1f9e7fbda54a95dfd58a";
// const API_URL = "https://trackapi.nutritionix.com/v2/search/instant";

// Mock data for testing
const mockNutritionData: NutritionItem[] = [
  {
    food_name: "apple",
    serving_qty: 1,
    serving_unit: "medium (3\" dia)",
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    photo: {
      thumb: "https://nix-tag-images.s3.amazonaws.com/384_thumb.jpg"
    }
  },
  {
    food_name: "banana",
    serving_qty: 1,
    serving_unit: "medium (7\" to 7-7/8\" long)",
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    photo: {
      thumb: "https://nix-tag-images.s3.amazonaws.com/315_thumb.jpg"
    }
  },
  {
    food_name: "chicken breast",
    serving_qty: 3,
    serving_unit: "oz",
    calories: 140,
    protein: 26,
    carbs: 0,
    fat: 3,
    photo: {
      thumb: "https://nix-tag-images.s3.amazonaws.com/7820_thumb.jpg"
    }
  }
];

export const useNutritionSearch = () => {
  const [results, setResults] = useState<NutritionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const search = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Instead of making an API call, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter mock data based on query
      const filteredResults = mockNutritionData.filter(item => 
        item.food_name.toLowerCase().includes(query.toLowerCase())
      );
      
      setResults(filteredResults);
    } catch (error: any) {
      console.error("Nutrition search error:", error);
      toast({
        title: "Search Error",
        description: "Failed to search for nutrition information",
        variant: "destructive",
      });
      
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { results, isLoading, search };
};
