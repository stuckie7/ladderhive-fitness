
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
  category?: string | null;
  difficulty?: string | null;
  avg_duration_minutes?: number | null;
  created_at?: string | null;
  is_favorite?: boolean;
}

export interface WodFilters {
  difficulty?: string;
  category?: string;
  duration?: number;
}
