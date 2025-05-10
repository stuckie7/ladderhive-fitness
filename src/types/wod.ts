
export interface WodComponent {
  order: number;
  description: string;
}

export interface Wod {
  id: string;
  name: string;
  description?: string;
  components: WodComponent[];
  video_url?: string;
  category?: string;
  difficulty?: string;
  avg_duration_minutes?: number;
  created_at?: string;
  is_favorite?: boolean;
}

export interface WodFilters {
  difficulty?: string;
  category?: string;
  duration?: number;
}
