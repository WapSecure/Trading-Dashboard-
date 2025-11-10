"use client";

import React, { memo } from "react";
import { TickerData } from "@/app/types/market";
import { useMarketStore } from "@/app/stores/market-store";
import { FavoriteButton } from "./FavoriteButton";

interface TickerCardProps {
  symbol: string;
  data: TickerData;
}

export const TickerCard = memo(({ symbol, data }: TickerCardProps) => {
  const { selectedSymbol, setSelectedSymbol, isFavorite } = useMarketStore();
  const isSelected = selectedSymbol === symbol;
  const isFav = isFavorite(symbol);

  const handleClick = () => {
    setSelectedSymbol(symbol);
  };

  const changeColor =
    data.change >= 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  const changePrefix = data.change >= 0 ? "+" : "";

  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
        ${
          isSelected
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        }
        bg-white dark:bg-gray-800 hover:shadow-md
      `}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {symbol.replace("USDT", "")}
          </h3>
          {isFav && <span className="text-yellow-500 text-sm">★</span>}
        </div>
        <FavoriteButton symbol={symbol} />
      </div>

      <div className="space-y-1">
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          $
          {data.price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          })}
        </div>

        <div className={`text-sm font-medium ${changeColor}`}>
          {changePrefix}
          {data.change.toFixed(2)} ({changePrefix}
          {data.changePercent.toFixed(2)}%)
        </div>

        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 pt-1">
          <span>Vol: {(data.volume / 1000).toFixed(1)}K</span>
          <span>High: ${data.high.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
});

TickerCard.displayName = "TickerCard";
