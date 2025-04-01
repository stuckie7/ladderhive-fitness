
export interface NutritionItem {
  food_name: string;
  serving_qty: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  photo?: {
    thumb: string;
  };
}

export interface NutritionSearchResponse {
  common: Array<{
    food_name: string;
    serving_unit: string;
    tag_name: string;
    serving_qty: number;
    photo: {
      thumb: string;
    };
    locale: string;
  }>;
  branded: Array<any>;
}
