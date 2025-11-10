"use client";

import React, { memo } from "react";

interface ConnectionStatusProps {
  status: "connected" | "connecting" | "disconnected" | "error";
}

export const ConnectionStatus = memo(({ status }: ConnectionStatusProps) => {
  const statusConfig = {
    connected: {
      color: "bg-green-500",
      text: "Connected",
      pulse: false,
    },
    connecting: {
      color: "bg-yellow-500",
      text: "Connecting...",
      pulse: true,
    },
    disconnected: {
      color: "bg-gray-500",
      text: "Disconnected",
      pulse: false,
    },
    error: {
      color: "bg-red-500",
      text: "Connection Error",
      pulse: true,
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div
        className={`w-2 h-2 rounded-full ${config.color} ${
          config.pulse ? "animate-pulse" : ""
        }`}
      />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {config.text}
      </span>
    </div>
  );
});

ConnectionStatus.displayName = "ConnectionStatus";
