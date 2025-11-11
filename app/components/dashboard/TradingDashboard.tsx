"use client";

import React, { useMemo } from "react";
import { useMarketStore } from "@/app/stores/market-store";
import { TickerGrid } from "@/app/components/price-ticker/TickerGrid";
import { PriceChart } from "@/app/components/charts/PriceChart";
import { OrderBook } from "@/app/components/order-book/OrderBook";
import { ConnectionStatus } from "@/app/components/ui/ConnectionStatus";
import { ThemeToggle } from "@/app/components/ui/ThemeToggle";
import { SYMBOLS } from "@/app/lib/constants";
import { usePriceHistory } from "@/app/hooks/use-market-data";
import { PriceAlerts } from "@/app/components/alerts/PriceAlerts";
import { CandlestickChart } from "@/app/components/charts/CandlestickChart";

export const TradingDashboard: React.FC = () => {
  const {
    selectedSymbol,
    getTicker,
    connectionStatus,
    favorites,
    timeInterval,
  } = useMarketStore();


  const { data: priceHistory, isLoading: isChartLoading } = usePriceHistory(
    selectedSymbol,
    timeInterval
  );

  const selectedTicker = useMemo(
    () => getTicker(selectedSymbol),
    [getTicker, selectedSymbol]
  );

  const favoriteTickers = useMemo(() => {
    return SYMBOLS.filter((symbol) => favorites.has(symbol));
  }, [favorites]);

  const hasTickerData =
    selectedTicker &&
    selectedTicker.symbol &&
    typeof selectedTicker.price === "number";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white transition-colors">
              Trading Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors">
              Real-time cryptocurrency prices and trading data
            </p>
          </div>
          {/* <div className="flex items-center gap-4">
            <ConnectionStatus status={connectionStatus} />
            <ThemeToggle />
          </div> */}
        </div>

        <div className="hidden lg:block">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
              Favorites
            </h2>
            <TickerGrid symbols={favoriteTickers} compact />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
            All Markets
          </h2>
          <TickerGrid symbols={SYMBOLS} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <PriceChart data={priceHistory || []} interval={timeInterval} />

            <CandlestickChart
              data={priceHistory || []}
              interval={timeInterval}
            />
          </div>

          <div className="xl:col-span-1 space-y-6">
            <OrderBook symbol={selectedSymbol} />
            <PriceAlerts />

            {hasTickerData ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 transition-colors">
                  Market Stats - {selectedSymbol.replace("USDT", "")}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 transition-colors">
                      Price
                    </span>
                    <div className="font-medium text-gray-900 dark:text-white transition-colors">
                      $
                      {selectedTicker.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 transition-colors">
                      24h Change
                    </span>
                    <div
                      className={`font-medium ${
                        selectedTicker.change >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      } transition-colors`}
                    >
                      {selectedTicker.change >= 0 ? "+" : ""}
                      {selectedTicker.change.toFixed(2)} (
                      {selectedTicker.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 transition-colors">
                      24h Volume
                    </span>
                    <div className="font-medium text-gray-900 dark:text-white transition-colors">
                      ${((selectedTicker.volume || 0) / 1000000).toFixed(2)}M
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 transition-colors">
                      24h High
                    </span>
                    <div className="font-medium text-gray-900 dark:text-white transition-colors">
                      $
                      {(selectedTicker.high || selectedTicker.price).toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600 dark:text-gray-400 transition-colors">
                      24h Low
                    </span>
                    <div className="font-medium text-gray-900 dark:text-white transition-colors">
                      ${(selectedTicker.low || selectedTicker.price).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
