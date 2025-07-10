
// This file is kept for backward compatibility
// It re-exports the refactored hook from its new location
export { useActivityProgress } from './activity-progress';

// Re-export types using 'export type' for compatibility with isolatedModules
export type { 
  ActivityData,
  MonthlySummary,
  ActivityProgressResult
} from './activity-progress';
