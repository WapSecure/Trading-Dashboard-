import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  TickerData,
  OrderBookData,
  PriceHistory,
  TimeInterval,
} from "@/app/types/market";

interface MarketState {
  tickers: Map<string, TickerData>;
  orderBooks: Map<string, OrderBookData>;
  priceHistory: Map<string, PriceHistory[]>;
  selectedSymbol: string;
  timeInterval: TimeInterval;
  favorites: Set<string>;
  connectionStatus: "connected" | "connecting" | "disconnected" | "error";

  updateTicker: (symbol: string, data: Partial<TickerData>) => void;
  updateOrderBook: (symbol: string, data: OrderBookData) => void;
  updatePriceHistory: (symbol: string, data: PriceHistory[]) => void;
  setSelectedSymbol: (symbol: string) => void;
  setTimeInterval: (interval: TimeInterval) => void;
  toggleFavorite: (symbol: string) => void;
  setConnectionStatus: (status: MarketState["connectionStatus"]) => void;

  getTicker: (symbol: string) => TickerData | undefined;
  getOrderBook: (symbol: string) => OrderBookData | undefined;
  getPriceHistory: (symbol: string) => PriceHistory[] | undefined;
  isFavorite: (symbol: string) => boolean;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      tickers: new Map(),
      orderBooks: new Map(),
      priceHistory: new Map(),
      selectedSymbol: "BTCUSDT",
      timeInterval: "1h",
      favorites: new Set(["BTCUSDT", "ETHUSDT"]),
      connectionStatus: "disconnected",

      updateTicker: (symbol, data) =>
        set((state) => {
          const current = state.tickers.get(symbol);
          const updated = {
            ...current,
            ...data,
            symbol,
            lastUpdate: new Date(),
          } as TickerData;

          const newTickers = new Map(state.tickers);
          newTickers.set(symbol, updated);
          return { tickers: newTickers };
        }),

      updateOrderBook: (symbol, data) =>
        set((state) => {
          const newOrderBooks = new Map(state.orderBooks);
          newOrderBooks.set(symbol, { ...data, lastUpdate: new Date() });
          return { orderBooks: newOrderBooks };
        }),

      updatePriceHistory: (symbol, data) =>
        set((state) => {
          const newPriceHistory = new Map(state.priceHistory);
          newPriceHistory.set(symbol, data);
          return { priceHistory: newPriceHistory };
        }),

      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
      setTimeInterval: (timeInterval) => set({ timeInterval }),

      toggleFavorite: (symbol) =>
        set((state) => {
          const newFavorites = new Set(state.favorites);
          if (newFavorites.has(symbol)) {
            newFavorites.delete(symbol);
          } else {
            newFavorites.add(symbol);
          }
          return { favorites: newFavorites };
        }),

      setConnectionStatus: (status) => set({ connectionStatus: status }),

      getTicker: (symbol) => get().tickers.get(symbol),
      getOrderBook: (symbol) => get().orderBooks.get(symbol),
      getPriceHistory: (symbol) => get().priceHistory.get(symbol),
      isFavorite: (symbol) => get().favorites.has(symbol),
    }),
    {
      name: "market-storage",
      partialize: (state) => ({
        favorites: Array.from(state.favorites),
        selectedSymbol: state.selectedSymbol,
        timeInterval: state.timeInterval,
      }),
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          if (parsed.state && Array.isArray(parsed.state.favorites)) {
            parsed.state.favorites = new Set(parsed.state.favorites);
          }
          return parsed;
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          localStorage.removeItem(name);
        },
      },
    }
  )
);
