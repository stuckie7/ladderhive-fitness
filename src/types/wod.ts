
export interface WodComponent {
  order: number;
  description: string;
}

export interface Wod {
  id: string;
  name: string;
  description?: string;
  components: WodComponent[];
  video_url?: string | null;
  video_demo?: string | null;
  category?: string | null;
  difficulty?: string | null;
  avg_duration_minutes?: number | null;
  created_at?: string | null;
  is_favorite?: boolean;
  part_1?: string | null;
  part_2?: string | null;
  part_3?: string | null;
  part_4?: string | null;
  part_5?: string | null;
  part_6?: string | null;
  part_7?: string | null;
  part_8?: string | null;
  part_9?: string | null;
  part_10?: string | null;
}

export interface WodFilters {
  search?: string;
  difficulty: string[];
  category: string[];
  duration: string[];
  equipment: string[];
  special: string[];
}
