"use client";

import React from "react";
import { useMarketStore } from "@/app/stores/market-store";
import { TimeInterval } from "@/app/types/market";

const INTERVALS: { value: TimeInterval; label: string }[] = [
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
  { value: "15m", label: "15m" },
  { value: "1h", label: "1h" },
  { value: "4h", label: "4h" },
  { value: "1d", label: "1d" },
];

export const TimeIntervalSelector: React.FC = () => {
  const { timeInterval, setTimeInterval } = useMarketStore();

  return (
    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {INTERVALS.map((interval) => (
        <button
          key={interval.value}
          onClick={() => setTimeInterval(interval.value)}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            timeInterval === interval.value
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {interval.label}
        </button>
      ))}
    </div>
  );
};
