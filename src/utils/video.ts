import { Exercise } from '@/types/exercise';
import { Wod } from '@/types/wod';

/**
 * Return the first non-empty video URL we can find on an Exercise or WOD record.
 * The order of fields represents our preference priority.
 */
export const getBestVideoUrl = (
  exercise?: Partial<Exercise> | null,
  wod?: Partial<Wod> | null
): string | null => {
  const candidates: (string | undefined)[] = [
    // Exercise-level options (most specific first)
    (exercise as any)?.video_demo,
    (exercise as any)?.video_url,
    exercise?.short_youtube_demo,
    exercise?.in_depth_youtube_exp,
    exercise?.video_demonstration_url,
    exercise?.video_explanation_url,
    // WOD-level fallback
    (wod as any)?.video_demo,
    (wod as any)?.video_url,
    wod?.video_url,
  ];
  const found = candidates.find((url) => typeof url === 'string' && url.trim().length > 0);
  return found ?? null;
};

/** Extract YouTube video ID from a URL (basic regex match). */
export const getYoutubeId = (url?: string | null): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.*\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
};

/** Return a YouTube embed URL suitable for an iframe. */
export const getYoutubeEmbedUrl = (url?: string | null): string | null => {
  const id = getYoutubeId(url ?? undefined);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
};
