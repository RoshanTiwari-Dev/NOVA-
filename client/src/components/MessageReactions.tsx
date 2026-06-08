import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Heart, Smile } from 'lucide-react';

interface MessageReactionsProps {
  messageId: number;
  onReact: (messageId: number, reaction: string) => void;
  isDarkMode?: boolean;
}

const REACTIONS = [
  { emoji: '👍', icon: ThumbsUp, label: 'Thumbs Up' },
  { emoji: '👎', icon: ThumbsDown, label: 'Thumbs Down' },
  { emoji: '❤️', icon: Heart, label: 'Love' },
  { emoji: '😊', icon: Smile, label: 'Smile' },
];

export function MessageReactions({ messageId, onReact, isDarkMode = false }: MessageReactionsProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>({});

  const handleReact = (emoji: string) => {
    setReactions(prev => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));
    onReact(messageId, emoji);
    setShowReactions(false);
  };

  return (
    <div className="relative inline-block">
      {/* Reaction Button */}
      <button
        onClick={() => setShowReactions(!showReactions)}
        className={`p-1.5 rounded-lg transition-colors ${
          isDarkMode
            ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
            : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
        }`}
        title="Add reaction"
      >
        <Smile className="w-4 h-4" />
      </button>

      {/* Reaction Picker */}
      {showReactions && (
        <div
          className={`absolute bottom-full right-0 mb-2 p-2 rounded-lg shadow-lg flex gap-2 ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          {REACTIONS.map(({ emoji, icon: Icon, label }) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className={`p-2 rounded transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
              }`}
              title={label}
            >
              <span className="text-lg">{emoji}</span>
            </button>
          ))}
        </div>
      )}

      {/* Reaction Display */}
      {Object.keys(reactions).length > 0 && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {Object.entries(reactions).map(([emoji, count]) => (
            <span
              key={emoji}
              className={`text-xs px-2 py-1 rounded-full ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {emoji} {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
