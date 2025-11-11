"use client";

import { useTheme } from "@/app/providers/ThemeProvider";

export default function TestV4Page() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Tailwind v4 Theme Test
          </h1>
          <button
            onClick={toggleTheme}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Current: {theme} - Click to toggle
          </button>
        </div>

        {/* Test Tailwind v4 dark mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              White/Gray-800
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Should change with theme
            </p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Gray-100/Gray-700
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Should change with theme
            </p>
          </div>
        </div>

        {/* Test if colors are working */}
        <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
          <h3 className="font-semibold text-red-800 dark:text-red-200">
            Color Test
          </h3>
          <p>This should be red in light mode, dark red in dark mode</p>
        </div>

        {/* Debug info */}
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <p>
            Theme: <strong>{theme}</strong>
          </p>
          <p>
            HTML has 'dark' class:{" "}
            <strong>
              {typeof document !== "undefined"
                ? document.documentElement.classList.contains("dark").toString()
                : "checking..."}
            </strong>
          </p>
          <p>Tailwind Version: v4</p>
        </div>
      </div>
    </div>
  );
}
