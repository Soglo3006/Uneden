"use client";

interface Reaction {
  emoji: string;
  user_ids: string[];
}

interface MessageReactionsProps {
  reactions: Reaction[];
  currentUserId: string;
  onReactionClick: (emoji: string) => void;
}

export function MessageReactions({
  reactions,
  currentUserId,
  onReactionClick,
}: MessageReactionsProps) {
  if (!reactions?.length) return null;

  const userReaction = reactions.find(r => r.user_ids.includes(currentUserId));

  if (!userReaction) return null;

  return (
    <button
      onClick={() => onReactionClick(userReaction.emoji)}
      className="
        h-7 w-7
        rounded-full
        bg-green-700
        border-2 border-white
        shadow-md
        flex items-center justify-center
        transition-all
        hover:scale-110
        active:scale-95
      "
    >
      <span className="text-base leading-none">{userReaction.emoji}</span>
    </button>
  );
}