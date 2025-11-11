"use client";

import { useTheme } from "@/app/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <span className="flex items-center justify-center">
        {theme === "light" ? (
          <>
            <span className="mr-2 text-lg">🌙</span>
            Dark Mode
          </>
        ) : (
          <>
            <span className="mr-2 text-lg">☀️</span>
            Light Mode
          </>
        )}
      </span>
    </button>
  );
}
