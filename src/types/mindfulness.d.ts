declare module '@/components/mindfulness/MoodQuiz' {
  import { FC } from 'react';
  
  interface MoodQuizProps {
    onComplete: () => void;
    onDismiss: () => void;
  }
  
  export const MoodQuiz: FC<MoodQuizProps>;
}
