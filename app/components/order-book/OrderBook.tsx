"use client";

import React, { memo, useMemo } from "react";
import { OrderBookData, OrderLevel } from "@/app/types/market";
import { useOrderBook } from "@/app/hooks/use-order-book";

interface OrderBookProps {
  symbol: string;
}

export const OrderBook = memo(({ symbol }: OrderBookProps) => {
  const { data: orderBookData, isLoading, error } = useOrderBook(symbol);

  const [bidsToShow, asksToShow] = useMemo(() => {
    if (!orderBookData) return [[], []];
    return [orderBookData.bids.slice(0, 8), orderBookData.asks.slice(0, 8)];
  }, [orderBookData]);

  const maxTotal = useMemo(() => {
    if (!orderBookData) return 1;
    const allTotals = [...bidsToShow, ...asksToShow].map(
      (level) => level.total
    );
    return Math.max(...allTotals, 1);
  }, [bidsToShow, asksToShow]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderBookData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Order Book - {symbol.replace("USDT", "")}
        </h2>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          Unable to load order book data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Order Book - {symbol.replace("USDT", "")}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Bids */}
        <div>
          <div className="grid grid-cols-3 text-xs text-gray-500 dark:text-gray-400 font-medium mb-2 px-1">
            <span>Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>
          <div className="space-y-1">
            {bidsToShow.map((level, index) => (
              <OrderBookLevel
                key={`bid-${level.price}-${index}`}
                level={level}
                type="bid"
                maxTotal={maxTotal}
              />
            ))}
          </div>
        </div>

        {/* Asks */}
        <div>
          <div className="grid grid-cols-3 text-xs text-gray-500 dark:text-gray-400 font-medium mb-2 px-1">
            <span>Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>
          <div className="space-y-1">
            {asksToShow.map((level, index) => (
              <OrderBookLevel
                key={`ask-${level.price}-${index}`}
                level={level}
                type="ask"
                maxTotal={maxTotal}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Spread:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {orderBookData.spread.toFixed(2)} (
            {orderBookData.spreadPercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
});

OrderBook.displayName = "OrderBook";

interface OrderBookLevelProps {
  level: OrderLevel;
  type: "bid" | "ask";
  maxTotal: number;
}

const OrderBookLevel = memo(
  ({ level, type, maxTotal }: OrderBookLevelProps) => {
    const widthPercentage = (level.total / maxTotal) * 100;
    const bgColor =
      type === "bid"
        ? "bg-green-100 dark:bg-green-900/30"
        : "bg-red-100 dark:bg-red-900/30";
    const textColor =
      type === "bid"
        ? "text-green-700 dark:text-green-300"
        : "text-red-700 dark:text-red-300";

    return (
      <div className="relative grid grid-cols-3 text-sm px-1 py-1 rounded text-xs transition-all duration-300 ease-in-out">
        <div
          className={`absolute inset-y-0 ${bgColor} transition-all duration-300 ease-in-out rounded`}
          style={{
            width: `${widthPercentage}%`,
            [type === "bid" ? "right" : "left"]: "auto",
          }}
        />
        <span
          className={`relative font-medium ${textColor} z-10 transition-colors duration-200`}
        >
          {level.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
        <span className="relative text-right text-gray-600 dark:text-gray-300 z-10 transition-colors duration-200">
          {level.quantity.toLocaleString()}
        </span>
        <span className="relative text-right text-gray-600 dark:text-gray-300 z-10 transition-colors duration-200">
          {level.total.toLocaleString()}
        </span>
      </div>
    );
  }
);

OrderBookLevel.displayName = "OrderBookLevel";
