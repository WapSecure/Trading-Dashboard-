import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: "above" | "below";
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

interface AlertState {
  alerts: PriceAlert[];
  addAlert: (
    alert: Omit<PriceAlert, "id" | "createdAt" | "triggeredAt">
  ) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  checkAlerts: (symbol: string, currentPrice: number) => void;
  getAlertsForSymbol: (symbol: string) => PriceAlert[];
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: [],

      addAlert: (alertData) => {
        const newAlert: PriceAlert = {
          ...alertData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          isActive: true,
        };

        set((state) => ({
          alerts: [...state.alerts, newAlert],
        }));
      },

      removeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((alert) => alert.id !== id),
        }));
      },

      toggleAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
          ),
        }));
      },

      checkAlerts: (symbol, currentPrice) => {
        const { alerts } = get();
        const now = new Date();

        alerts.forEach((alert) => {
          if (!alert.isActive || alert.triggeredAt || alert.symbol !== symbol)
            return;

          const shouldTrigger =
            (alert.condition === "above" &&
              currentPrice >= alert.targetPrice) ||
            (alert.condition === "below" && currentPrice <= alert.targetPrice);

          if (shouldTrigger) {
            set((state) => ({
              alerts: state.alerts.map((a) =>
                a.id === alert.id ? { ...a, triggeredAt: now } : a
              ),
            }));

            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification(`Price Alert: ${alert.symbol}`, {
                body: `Price is ${alert.condition} ${alert.targetPrice}. Current: ${currentPrice}`,
                icon: "/favicon.ico",
                tag: alert.id,
              });
            }
          }
        });
      },

      getAlertsForSymbol: (symbol) => {
        return get().alerts.filter((alert) => alert.symbol === symbol);
      },
    }),
    {
      name: "alert-storage",
    }
  )
);
