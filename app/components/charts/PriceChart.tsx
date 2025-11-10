"use client";

import { memo, useMemo, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PriceHistory } from "@/app/types/market";
import { TimeIntervalSelector } from "./TimeIntervalSelector";
import { useMarketStore } from "@/app/stores/market-store";

interface PriceChartProps {
  data: PriceHistory[];
  interval: string;
}

const safeDateConversion = (timestamp: any): Date => {
  try {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === "string" || typeof timestamp === "number") {
      return new Date(timestamp);
    }
    throw new Error("Invalid timestamp format");
  } catch (error) {
    console.warn("Failed to parse timestamp, using current date:", error);
    return new Date();
  }
};

export const PriceChart = memo(({ data, interval }: PriceChartProps) => {
  const { selectedSymbol, getTicker } = useMarketStore();
  const [realTimeData, setRealTimeData] = useState<PriceHistory[]>([]);
  const [hasError, setHasError] = useState(false);
  const currentTicker = getTicker(selectedSymbol);

  useEffect(() => {
    try {
      if (data && data.length > 0) {
        const convertedData = data.map((item) => ({
          ...item,
          timestamp: safeDateConversion(item.timestamp),
        }));
        setRealTimeData(convertedData);
        setHasError(false);
      }
    } catch (error) {
      console.error("Error processing chart data:", error);
      setHasError(true);
    }
  }, [data]);

  useEffect(() => {
    if (!currentTicker || hasError) return;

    try {
      const now = new Date();

      if (realTimeData.length === 0) {
        setRealTimeData([
          {
            timestamp: now,
            open: currentTicker.price,
            high: currentTicker.price,
            low: currentTicker.price,
            close: currentTicker.price,
            volume: currentTicker.volume || 0,
          },
        ]);
        return;
      }

      const latestDataPoint = realTimeData[realTimeData.length - 1];
      const timeDiff = now.getTime() - latestDataPoint.timestamp.getTime();
      const intervalMs = getIntervalMilliseconds(interval);

      if (timeDiff < intervalMs) {
        setRealTimeData((prev) => {
          const newData = [...prev];
          const lastIndex = newData.length - 1;

          newData[lastIndex] = {
            ...newData[lastIndex],
            high: Math.max(newData[lastIndex].high, currentTicker.price),
            low: Math.min(newData[lastIndex].low, currentTicker.price),
            close: currentTicker.price,
            volume:
              (newData[lastIndex].volume || 0) +
              (currentTicker.volume || 0) / 1000,
          };

          return newData;
        });
      } else {
        const newCandle: PriceHistory = {
          timestamp: now,
          open: latestDataPoint.close,
          high: currentTicker.price,
          low: currentTicker.price,
          close: currentTicker.price,
          volume: currentTicker.volume || 0,
        };

        setRealTimeData((prev) => {
          const newData = [...prev, newCandle];
          return newData.slice(-100);
        });
      }
    } catch (error) {
      console.error("Error updating real-time data:", error);
      setHasError(true);
    }
  }, [currentTicker, interval, realTimeData.length, hasError]);

  const chartData = useMemo(() => {
    try {
      return realTimeData.map((item) => ({
        ...item,
        timestamp: item.timestamp.getTime(),
        formattedTime: formatTime(item.timestamp, interval),
      }));
    } catch (error) {
      console.error("Error formatting chart data:", error);
      setHasError(true);
      return [];
    }
  }, [realTimeData, interval]);

  const chartColor = useMemo(() => {
    if (realTimeData.length < 2) return "#3B82F6";
    try {
      const first = realTimeData[0].close;
      const last = realTimeData[realTimeData.length - 1].close;
      return last >= first ? "#10B981" : "#EF4444";
    } catch (error) {
      console.error("Error calculating chart color:", error);
      return "#3B82F6";
    }
  }, [realTimeData]);

  const getIntervalMilliseconds = (interval: string): number => {
    const intervals: { [key: string]: number } = {
      "1m": 60 * 1000,
      "5m": 5 * 60 * 1000,
      "15m": 15 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "4h": 4 * 60 * 60 * 1000,
      "1d": 24 * 60 * 60 * 1000,
    };
    return intervals[interval] || 60 * 1000;
  };

  if (hasError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Price Chart - {selectedSymbol.replace("USDT", "")}
          </h2>
          <TimeIntervalSelector />
        </div>
        <div className="h-80 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-yellow-500 mb-2">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-center mb-4">Unable to load chart data</p>
          <button
            onClick={() => setHasError(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (realTimeData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Price Chart - {selectedSymbol.replace("USDT", "")}
          </h2>
          <TimeIntervalSelector />
        </div>
        <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="animate-pulse flex space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce delay-200"></div>
          </div>
          <span className="ml-2">Loading chart data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Price Chart - {selectedSymbol.replace("USDT", "")}
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            • Live Updates
          </span>
        </h2>
        <TimeIntervalSelector />
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              opacity={0.3}
            />
            <XAxis
              dataKey="formattedTime"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["dataMin - 0.01", "dataMax + 0.01"]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} animationDuration={200} />
            <Line
              type="monotone"
              dataKey="close"
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 0,
                fill: chartColor,
                className: "transition-all duration-200",
              }}
              animationDuration={300}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-end mt-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div
            className={`w-2 h-2 rounded-full ${
              (currentTicker?.change ?? 0) >= 0
                ? "bg-green-500 animate-pulse"
                : "bg-red-500 animate-pulse"
            }`}
          ></div>
          <span>Live</span>
          <span>•</span>
          <span>
            $
            {currentTicker?.price?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            }) || "0.00"}
          </span>
        </div>
      </div>
    </div>
  );
});

PriceChart.displayName = "PriceChart";

const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400 text-sm">{label}</p>
        <p className="text-green-500 font-medium text-lg">
          $
          {data.close?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          }) || "0.00"}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
          <span className="text-gray-500">High:</span>
          <span className="text-gray-900 dark:text-white">
            ${(data.high || 0).toFixed(2)}
          </span>
          <span className="text-gray-500">Low:</span>
          <span className="text-gray-900 dark:text-white">
            ${(data.low || 0).toFixed(2)}
          </span>
          <span className="text-gray-500">Open:</span>
          <span className="text-gray-900 dark:text-white">
            ${(data.open || 0).toFixed(2)}
          </span>
          <span className="text-gray-500">Volume:</span>
          <span className="text-gray-900 dark:text-white">
            {((data.volume || 0) / 1000).toFixed(1)}K
          </span>
        </div>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = "CustomTooltip";

function formatTime(timestamp: Date, interval: string): string {
  try {
    if (interval === "1d" || interval === "4h") {
      return timestamp.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (interval === "1h" || interval === "15m") {
      return timestamp.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else {
      return timestamp.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    }
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Invalid Date";
  }
}
