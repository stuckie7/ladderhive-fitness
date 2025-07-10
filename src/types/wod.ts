

export interface WodFilters {
  search: string;
  difficulty: string[];
  category: string[];
  duration: string[];
  equipment?: string[];  // Made optional
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

export interface SimpleWodComponent {
  order: number;
  description: string;
}

export interface Wod {
  id: string;
  title: string;
  name?: string; // Adding this field for backward compatibility
  description: string;
  category: string;
  difficulty: string;
  duration_minutes?: number; // Made optional to match other interfaces
  avg_duration_minutes?: number; // Adding this field for backward compatibility
  created_at: string;
  equipment_needed?: string[];
  is_featured?: boolean;
  is_favorite?: boolean;
  is_new?: boolean;
  components?: WodComponent[];
  video_url?: string;
  image_url?: string;
  video_demo?: string; // Adding this field for backward compatibility
  
  // Adding part fields for backward compatibility
  part_1?: string;
  part_2?: string;
  part_3?: string;
  part_4?: string;
  part_5?: string;
  part_6?: string;
  part_7?: string;
  part_8?: string;
  part_9?: string;
  part_10?: string;
}

