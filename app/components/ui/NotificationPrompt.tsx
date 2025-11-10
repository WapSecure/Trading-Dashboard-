"use client";

import { useEffect, useState } from "react";

export const NotificationPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = async () => {
    const permission = await Notification.requestPermission();
    setShowPrompt(false);

    if (permission === "granted") {
      console.warn("Notification permission granted");
    }
  };

  const handleDeny = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
        Enable Price Alerts
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Get notified when prices hit your targets. We'll send browser
        notifications.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleAllow}
          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Allow
        </button>
        <button
          onClick={handleDeny}
          className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
        >
          Not Now
        </button>
      </div>
    </div>
  );
};
