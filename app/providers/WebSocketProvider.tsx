"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";
import { useMarketStore } from "@/app/stores/market-store";
import { useAlertStore } from "../stores/alert-store";

interface WebSocketContextType {
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

interface WebSocketProviderProps {
  symbols: readonly string[];
  children: React.ReactNode;
}

export function WebSocketProvider({
  symbols,
  children,
}: WebSocketProviderProps) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 8;
  const [isBrowser, setIsBrowser] = useState(false);

  const { updateTicker, setConnectionStatus } = useMarketStore();

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const connect = useCallback(() => {
    if (!isBrowser || ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionStatus("connecting");

      if (ws.current) {
        ws.current.close();
      }
      const endpoints = [
        "wss://ws.coincap.io/prices?assets=bitcoin,ethereum,cardano,polkadot,solana",
        "wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker/adausdt@ticker/dotusdt@ticker/solusdt@ticker",
        "wss://fstream.binance.com/ws/btcusdt@ticker/ethusdt@ticker/adausdt@ticker/dotusdt@ticker/solusdt@ticker",
      ];

      const endpoint = endpoints[0];

      ws.current = new WebSocket(endpoint);

      ws.current.onopen = () => {
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (typeof data === "object" && data) {
            const symbolMap: { [key: string]: string } = {
              bitcoin: "BTCUSDT",
              ethereum: "ETHUSDT",
              cardano: "ADAUSDT",
              polkadot: "DOTUSDT",
              solana: "SOLUSDT",
            };

            Object.entries(data).forEach(([asset, price]) => {
              const symbol = symbolMap[asset];
              if (symbol && typeof price === "string") {
                const current = useMarketStore.getState().getTicker(symbol);
                const newPrice = parseFloat(price);

                if (current && current.price) {
                  const change = newPrice - current.price;
                  const changePercent =
                    current.price !== 0 ? (change / current.price) * 100 : 0;

                  updateTicker(symbol, {
                    price: newPrice,
                    change: change,
                    changePercent: changePercent,
                    lastUpdate: new Date(),
                  });

                  useAlertStore.getState().checkAlerts(symbol, newPrice);
                } else {
                  updateTicker(symbol, {
                    price: newPrice,
                    change: 0,
                    changePercent: 0,
                    volume: Math.random() * 1000000 + 500000,
                    high: newPrice * (1 + Math.random() * 0.02),
                    low: newPrice * (1 - Math.random() * 0.02),
                    lastUpdate: new Date(),
                  });
                }
              }
            });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.current.onclose = (event) => {
        setConnectionStatus("disconnected");

        if (event.code !== 1000 && event.code !== 1001) {
          attemptReconnect();
        }
      };

      ws.current.onerror = (event) => {
        console.error("WebSocket connection failed");
        setConnectionStatus("error");

        if (reconnectAttempts.current < maxReconnectAttempts) {
          attemptReconnect();
        }
      };
    } catch (error) {
      console.error("WebSocket setup failed:", error);
      setConnectionStatus("error");
      attemptReconnect();
    }
  }, [isBrowser, setConnectionStatus, updateTicker]);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current += 1;
      const delay = Math.min(
        1000 * Math.pow(1.5, reconnectAttempts.current),
        15000
      );

      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, delay);
    } else {
      initializeFallbackData();
    }
  }, [connect]);

  const initializeFallbackData = useCallback(() => {
    symbols.forEach(async (symbol) => {
      try {
        const response = await fetch(`/api/ticker?symbol=${symbol}`);

        if (response.ok) {
          const data = await response.json();

          updateTicker(symbol, {
            price: parseFloat(data.lastPrice),
            change: parseFloat(data.priceChange),
            changePercent: parseFloat(data.priceChangePercent),
            volume: parseFloat(data.volume),
            high: parseFloat(data.highPrice),
            low: parseFloat(data.lowPrice),
            lastUpdate: new Date(),
          });
        } else {
          throw new Error(`API responded with status: ${response.status}`);
        }
      } catch (error) {
        console.error(`Failed to fetch ${symbol} data:`, error);
        initializeMockData();
      }
    });
  }, [symbols, updateTicker]);

  const initializeMockData = useCallback(() => {
    const mockTickers = {
      BTCUSDT: {
        price: 45123.45,
        change: 234.56,
        changePercent: 0.52,
        volume: 2850000000,
        high: 45500.0,
        low: 44800.0,
      },
      ETHUSDT: {
        price: 2432.18,
        change: 45.67,
        changePercent: 1.91,
        volume: 1350000000,
        high: 2450.0,
        low: 2400.0,
      },
      ADAUSDT: {
        price: 0.4567,
        change: 0.0234,
        changePercent: 5.41,
        volume: 450000000,
        high: 0.46,
        low: 0.44,
      },
      DOTUSDT: {
        price: 7.2345,
        change: 0.1234,
        changePercent: 1.74,
        volume: 180000000,
        high: 7.3,
        low: 7.1,
      },
      SOLUSDT: {
        price: 98.765,
        change: 2.345,
        changePercent: 2.43,
        volume: 950000000,
        high: 100.0,
        low: 96.0,
      },
    };

    symbols.forEach((symbol) => {
      if (mockTickers[symbol as keyof typeof mockTickers]) {
        const mockData = mockTickers[symbol as keyof typeof mockTickers];
        updateTicker(symbol, {
          ...mockData,
          lastUpdate: new Date(),
        });
      }
    });

    const interval = setInterval(() => {
      symbols.forEach((symbol) => {
        if (mockTickers[symbol as keyof typeof mockTickers]) {
          const current = useMarketStore.getState().getTicker(symbol);
          if (current) {
            const randomChange = (Math.random() - 0.5) * current.price * 0.002; // ±0.1%
            const newPrice = current.price + randomChange;
            const basePrice = current.price - current.change;
            const change = newPrice - basePrice;
            const changePercent = (change / basePrice) * 100;

            updateTicker(symbol, {
              price: newPrice,
              change: change,
              changePercent: changePercent,
              lastUpdate: new Date(),
            });
          }
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [symbols, updateTicker]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    if (ws.current) {
      ws.current.close(1000, "Component unmounting");
    }
  }, []);

  useEffect(() => {
    if (isBrowser) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [isBrowser, connect, disconnect]);

  useEffect(() => {
    if (isBrowser) {
      const timeout = setTimeout(() => {
        const currentStatus = useMarketStore.getState().connectionStatus;
        if (currentStatus !== "connected") {
          initializeFallbackData();
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isBrowser, initializeFallbackData]);

  const value: WebSocketContextType = {
    connect,
    disconnect,
    isConnected: useMarketStore.getState().connectionStatus === "connected",
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
