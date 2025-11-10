"use client";

import React, { memo } from "react";
import { useMarketStore } from "@/app/stores/market-store";
import { TickerCard } from "./TickerCard";

interface TickerGridProps {
  symbols: readonly string[];
  compact?: boolean;
}

export const TickerGrid = memo(
  ({ symbols, compact = false }: TickerGridProps) => {
    const { getTicker } = useMarketStore();

    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 ${
          compact ? "max-h-96 overflow-y-auto" : ""
        }`}
      >
        {symbols.map((symbol) => {
          const ticker = getTicker(symbol);
          if (!ticker) {
            return <TickerCardSkeleton key={symbol} symbol={symbol} />;
          }
          return <TickerCard key={symbol} symbol={symbol} data={ticker} />;
        })}
      </div>
    );
  }
);

TickerGrid.displayName = "TickerGrid";

const TickerCardSkeleton = ({ symbol }: { symbol: string }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
    <div className="flex justify-between items-start mb-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div>
    </div>
    <div className="space-y-2">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10"></div>
      </div>
    </div>
  </div>
);
