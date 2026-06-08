import { useState } from 'react';
import { Star } from 'lucide-react';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  isDarkMode?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({ isFavorite, onToggle, isDarkMode = false, size = 'md' }: FavoriteButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleClick}
      className={`transition-all duration-300 ${
        isAnimating ? 'scale-125' : 'scale-100'
      } ${
        isDarkMode
          ? 'hover:bg-gray-700 text-gray-400 hover:text-yellow-400'
          : 'hover:bg-gray-200 text-gray-600 hover:text-yellow-500'
      } p-1.5 rounded-lg`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        className={`${sizeClasses[size]} transition-all ${
          isFavorite
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-current'
        }`}
      />
    </button>
  );
}
