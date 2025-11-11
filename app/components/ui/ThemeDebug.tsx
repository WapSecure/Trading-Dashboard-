"use client";

import { useTheme } from "@/app/providers/ThemeProvider";
import { useEffect } from "react";

export function ThemeDebug() {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    console.log("Theme changed to:", theme);
    console.log("HTML has dark class:", document.documentElement.classList.contains("dark"));
  }, [theme]);

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg">
      <div className="text-sm">
        <div className="font-semibold text-gray-900 dark:text-white">
          Theme: {theme}
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
          HTML has 'dark': {document.documentElement.classList.contains("dark").toString()}
        </div>
        <button 
          onClick={toggleTheme}
          className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
        >
          Toggle Theme
        </button>
      </div>
    </div>
  );
}