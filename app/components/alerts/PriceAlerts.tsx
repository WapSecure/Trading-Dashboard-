"use client";

import React, { useState } from "react";
import { useAlertStore, PriceAlert } from "@/app/stores/alert-store";
import { useMarketStore } from "@/app/stores/market-store";

export const PriceAlerts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");

  const { selectedSymbol, getTicker } = useMarketStore();
  const { alerts, addAlert, removeAlert, toggleAlert, getAlertsForSymbol } =
    useAlertStore();

  const currentTicker = getTicker(selectedSymbol);
  const symbolAlerts = getAlertsForSymbol(selectedSymbol);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  };

  const handleAddAlert = async () => {
    if (!targetPrice || !currentTicker) return;

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      alert("Please enable browser notifications to receive price alerts");
      return;
    }

    addAlert({
      symbol: selectedSymbol,
      targetPrice: parseFloat(targetPrice),
      condition,
      isActive: true,
    });

    setTargetPrice("");
    setIsOpen(false);
  };

  const formatAlertCondition = (alert: PriceAlert) => {
    return `${alert.condition === "above" ? "Above" : "Below"} $${
      alert.targetPrice
    }`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Price Alerts
        </h3>
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          + Add Alert
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {symbolAlerts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
            No alerts set for {selectedSymbol.replace("USDT", "")}
          </p>
        ) : (
          symbolAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {alert.symbol.replace("USDT", "")}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-xs">
                    {formatAlertCondition(alert)}
                  </span>
                  {alert.triggeredAt && (
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
                      Triggered
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`px-2 py-1 text-xs rounded ${
                    alert.isActive
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {alert.isActive ? "Active" : "Inactive"}
                </button>

                <button
                  onClick={() => removeAlert(alert.id)}
                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Price Alert
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Symbol
                </label>
                <div className="text-gray-900 dark:text-white font-medium">
                  {selectedSymbol.replace("USDT", "")}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) =>
                    setCondition(e.target.value as "above" | "below")
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="above">Price goes above</option>
                  <option value="below">Price goes below</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Price (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder={`Current: $${currentTicker?.price.toFixed(2)}`}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleAddAlert}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Set Alert
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
