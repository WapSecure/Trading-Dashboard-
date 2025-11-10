'use client';

import React, { memo } from 'react';
import { useMarketStore } from '@/app/stores/market-store';

interface FavoriteButtonProps {
  symbol: string;
}

export const FavoriteButton = memo(({ symbol }: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite } = useMarketStore();
  const isFav = isFavorite(symbol);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(symbol);
  };

  return (
    <button
      onClick={handleClick}
      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFav ? (
        <span className="text-yellow-500 text-lg">★</span>
      ) : (
        <span className="text-gray-400 text-lg">☆</span>
      )}
    </button>
  );
});

FavoriteButton.displayName = 'FavoriteButton';