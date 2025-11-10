"use client";

import { memo, useMemo } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PriceHistory } from "@/app/types/market";
import { useMarketStore } from "@/app/stores/market-store";
import { TimeIntervalSelector } from "./TimeIntervalSelector";

interface CandlestickChartProps {
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

export const CandlestickChart = memo(
  ({ data, interval }: CandlestickChartProps) => {
    const { selectedSymbol } = useMarketStore();

    const chartData = useMemo(() => {
      try {
        return data.map((item) => ({
          ...item,
          // Ensure timestamp is a Date object
          timestamp: safeDateConversion(item.timestamp),
          formattedTime: formatTime(
            safeDateConversion(item.timestamp),
            interval
          ),
        }));
      } catch (error) {
        console.error("Error processing candlestick data:", error);
        return [];
      }
    }, [data, interval]);

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isBullish = data.close >= data.open;

        return (
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">{label}</p>
            <p
              className={`font-medium text-lg ${
                isBullish ? "text-green-500" : "text-red-500"
              }`}
            >
              $
              {data.close?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              }) || "0.00"}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
              <span className="text-gray-500">Open:</span>
              <span className="text-gray-900 dark:text-white">
                ${(data.open || 0).toFixed(2)}
              </span>
              <span className="text-gray-500">High:</span>
              <span className="text-gray-900 dark:text-white">
                ${(data.high || 0).toFixed(2)}
              </span>
              <span className="text-gray-500">Low:</span>
              <span className="text-gray-900 dark:text-white">
                ${(data.low || 0).toFixed(2)}
              </span>
              <span className="text-gray-500">Close:</span>
              <span className="text-gray-900 dark:text-white">
                ${(data.close || 0).toFixed(2)}
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
    };

    if (data.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Candlestick Chart - {selectedSymbol.replace("USDT", "")}
            </h2>
            <TimeIntervalSelector />
          </div>
          <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="animate-pulse flex space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce delay-200"></div>
            </div>
            <span className="ml-2">Loading candlestick data...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Candlestick Chart - {selectedSymbol.replace("USDT", "")}
          </h2>
          <TimeIntervalSelector />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
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
              <Tooltip content={<CustomTooltip />} />

              <Bar
                dataKey="close"
                fill="#8884d8"
                isAnimationActive={true}
                animationDuration={300}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
);

CandlestickChart.displayName = "CandlestickChart";

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
