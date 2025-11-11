"use client";

import { useTheme } from "@/app/providers/ThemeProvider";

export function ThemeTest() {
  const { theme } = useTheme();

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg transition-colors">
        <div className="text-xs font-medium text-gray-900 dark:text-white">
          Theme: <span className="font-bold">{theme}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Active
          </div>
        </div>
      </div>
    </div>
  );
}