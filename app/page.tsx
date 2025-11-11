import Link from "next/link";
import { ThemeToggle } from "./components/ui/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full text-center">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 transition-colors duration-300">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">
              Crypto Trading Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors">
              Real-time cryptocurrency prices, charts, and trading data
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Launch Dashboard
            </Link>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 transition-colors">
                <div className="font-semibold text-gray-900 dark:text-white transition-colors">
                  Real-time
                </div>
                <div className="text-gray-600 dark:text-gray-400 transition-colors">
                  Live Prices
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 transition-colors">
                <div className="font-semibold text-gray-900 dark:text-white transition-colors">
                  Advanced
                </div>
                <div className="text-gray-600 dark:text-gray-400 transition-colors">
                  Charts
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
