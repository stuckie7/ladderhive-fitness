
export interface WodFilters {
  search: string;
  difficulty: string[];
  category: string[];
  duration: string[];
  equipment: string[];
  special: string[];
}

export interface WodComponent {
  id: string;
  wod_id: string;
  type: string;
  description: string;
  order: number;
  reps?: number;
  time?: number;
  rounds?: number;
  exercises?: any[];
  rest?: number;
}

export interface Wod {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  created_at: string;
  equipment_needed?: string[];
  is_featured?: boolean;
  is_favorite?: boolean;
  is_new?: boolean;
  components?: WodComponent[];
  video_url?: string;
  image_url?: string;
}
