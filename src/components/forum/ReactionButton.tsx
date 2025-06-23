import { ThumbsUp } from 'lucide-react';
import { useReactions } from '@/hooks/useReactions';

interface Props {
  postId: number;
}

/** Small Like/Unlike button with live count */
export const ReactionButton: React.FC<Props> = ({ postId }) => {
  const { counts, hasReacted, toggleReaction } = useReactions(postId);

  return (
    <button
      type="button"
      onClick={toggleReaction}
      className={`flex items-center gap-1 text-sm hover:text-blue-600 transition-colors ${
        hasReacted ? 'text-blue-600' : 'text-gray-500'
      }`}
    >
      <ThumbsUp size={14} />
      {counts['👍'] ?? 0}
    </button>
  );
};
