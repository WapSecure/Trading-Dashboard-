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
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 8;
  const [isBrowser, setIsBrowser] = useState(false);

  const { updateTicker, setConnectionStatus } = useMarketStore();

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const setupHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }

    heartbeatInterval.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        try {
          ws.current.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.log('Heartbeat failed, reconnecting...');
          attemptReconnect();
        }
      }
    }, 30000);
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
      ];

      const endpoint = endpoints[0];

      ws.current = new WebSocket(endpoint);

      ws.current.onopen = () => {
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;
        setupHeartbeat();
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

        if (heartbeatInterval.current) {
          clearInterval(heartbeatInterval.current);
          heartbeatInterval.current = null;
        }

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
  }, [isBrowser, setConnectionStatus, updateTicker, setupHeartbeat]);

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
      }
    });
  }, [symbols, updateTicker]);

  const disconnect = useCallback(() => {
    
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
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
      }, 3000);

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