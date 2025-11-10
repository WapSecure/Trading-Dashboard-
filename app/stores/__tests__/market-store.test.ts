import { act } from "@testing-library/react";
import { useMarketStore } from "../market-store";
import { TickerData, OrderBookData, PriceHistory } from "@/app/types/market";

const originalState = useMarketStore.getState();

beforeEach(() => {
  act(() => {
    useMarketStore.setState(originalState);
  });
});

describe("useMarketStore", () => {
  const mockTicker: TickerData = {
    symbol: "BTCUSDT",
    price: 45000,
    change: 500,
    changePercent: 1.12,
    volume: 1000000,
    high: 45500,
    low: 44800,
    lastUpdate: new Date("2024-01-01T00:00:00Z"),
  };

  const mockOrderBook: OrderBookData = {
    bids: [
      { price: 44900, quantity: 1.5, total: 1.5 },
      { price: 44800, quantity: 2.0, total: 3.5 },
    ],
    asks: [
      { price: 45100, quantity: 1.2, total: 1.2 },
      { price: 45200, quantity: 1.8, total: 3.0 },
    ],
    spread: 200,
    spreadPercent: 0.44,
    lastUpdate: new Date("2024-01-01T00:00:00Z"),
  };

  const mockPriceHistory: PriceHistory[] = [
    {
      timestamp: new Date("2024-01-01T00:00:00Z"),
      open: 44800,
      high: 45200,
      low: 44700,
      close: 45000,
      volume: 500000,
    },
  ];

  describe("Ticker Management", () => {
    it("should update ticker data", () => {
      act(() => {
        useMarketStore.getState().updateTicker("BTCUSDT", mockTicker);
      });

      const ticker = useMarketStore.getState().getTicker("BTCUSDT");
      expect(ticker?.symbol).toBe(mockTicker.symbol);
      expect(ticker?.price).toBe(mockTicker.price);
      expect(ticker?.change).toBe(mockTicker.change);
      expect(ticker?.changePercent).toBe(mockTicker.changePercent);
      expect(ticker?.volume).toBe(mockTicker.volume);
      expect(ticker?.high).toBe(mockTicker.high);
      expect(ticker?.low).toBe(mockTicker.low);
      expect(ticker?.lastUpdate).toBeInstanceOf(Date);
    });

    it("should update partial ticker data", () => {
      act(() => {
        useMarketStore.getState().updateTicker("BTCUSDT", mockTicker);
      });

      act(() => {
        useMarketStore.getState().updateTicker("BTCUSDT", { price: 46000 });
      });

      const ticker = useMarketStore.getState().getTicker("BTCUSDT");
      expect(ticker?.price).toBe(46000);
      expect(ticker?.symbol).toBe("BTCUSDT");
      expect(ticker?.change).toBe(500);
      expect(ticker?.lastUpdate).toBeInstanceOf(Date);
    });

    it("should return undefined for non-existent ticker", () => {
      const ticker = useMarketStore.getState().getTicker("NONEXISTENT");
      expect(ticker).toBeUndefined();
    });

    it("should create new ticker if it does not exist", () => {
      act(() => {
        useMarketStore
          .getState()
          .updateTicker("NEWSYMBOL", { price: 100, change: 10 });
      });

      const ticker = useMarketStore.getState().getTicker("NEWSYMBOL");
      expect(ticker?.symbol).toBe("NEWSYMBOL");
      expect(ticker?.price).toBe(100);
      expect(ticker?.change).toBe(10);
      expect(ticker?.lastUpdate).toBeInstanceOf(Date);
    });
  });

  describe("Order Book Management", () => {
    it("should update order book data", () => {
      act(() => {
        useMarketStore.getState().updateOrderBook("BTCUSDT", mockOrderBook);
      });

      const orderBook = useMarketStore.getState().getOrderBook("BTCUSDT");
      expect(orderBook?.bids).toEqual(mockOrderBook.bids);
      expect(orderBook?.asks).toEqual(mockOrderBook.asks);
      expect(orderBook?.spread).toBe(mockOrderBook.spread);
      expect(orderBook?.spreadPercent).toBe(mockOrderBook.spreadPercent);
      expect(orderBook?.lastUpdate).toBeInstanceOf(Date);
    });

    it("should return undefined for non-existent order book", () => {
      const orderBook = useMarketStore.getState().getOrderBook("NONEXISTENT");
      expect(orderBook).toBeUndefined();
    });
  });

  describe("Price History Management", () => {
    it("should update price history data", () => {
      act(() => {
        useMarketStore
          .getState()
          .updatePriceHistory("BTCUSDT", mockPriceHistory);
      });

      const priceHistory = useMarketStore.getState().getPriceHistory("BTCUSDT");
      expect(priceHistory).toEqual(mockPriceHistory);
    });

    it("should return undefined for non-existent price history", () => {
      const priceHistory = useMarketStore
        .getState()
        .getPriceHistory("NONEXISTENT");
      expect(priceHistory).toBeUndefined();
    });
  });

  describe("Symbol Selection", () => {
    it("should set selected symbol", () => {
      act(() => {
        useMarketStore.getState().setSelectedSymbol("ETHUSDT");
      });

      expect(useMarketStore.getState().selectedSymbol).toBe("ETHUSDT");
    });
  });

  describe("Time Interval Management", () => {
    it("should set time interval", () => {
      act(() => {
        useMarketStore.getState().setTimeInterval("1d");
      });

      expect(useMarketStore.getState().timeInterval).toBe("1d");
    });

    it("should handle all time intervals", () => {
      const intervals = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;

      intervals.forEach((interval) => {
        act(() => {
          useMarketStore.getState().setTimeInterval(interval);
        });

        expect(useMarketStore.getState().timeInterval).toBe(interval);
      });
    });
  });

  describe("Favorites Management", () => {
    it("should add symbol to favorites", () => {
      act(() => {
        useMarketStore.getState().toggleFavorite("ADAUSDT");
      });

      expect(useMarketStore.getState().isFavorite("ADAUSDT")).toBe(true);
    });

    it("should remove symbol from favorites", () => {
      // First add to favorites
      act(() => {
        useMarketStore.getState().toggleFavorite("ADAUSDT");
      });

      // Then remove
      act(() => {
        useMarketStore.getState().toggleFavorite("ADAUSDT");
      });

      expect(useMarketStore.getState().isFavorite("ADAUSDT")).toBe(false);
    });

    it("should check if symbol is favorite", () => {
      act(() => {
        useMarketStore.getState().toggleFavorite("SOLUSDT");
      });

      expect(useMarketStore.getState().isFavorite("SOLUSDT")).toBe(true);
      expect(useMarketStore.getState().isFavorite("DOTUSDT")).toBe(false);
    });

    it("should handle multiple favorites", () => {
      const symbols = ["ADAUSDT", "SOLUSDT", "DOTUSDT"];

      symbols.forEach((symbol) => {
        act(() => {
          useMarketStore.getState().toggleFavorite(symbol);
        });
      });

      symbols.forEach((symbol) => {
        expect(useMarketStore.getState().isFavorite(symbol)).toBe(true);
      });
    });
  });

  describe("Connection Status", () => {
    it("should set connection status", () => {
      act(() => {
        useMarketStore.getState().setConnectionStatus("connected");
      });

      expect(useMarketStore.getState().connectionStatus).toBe("connected");
    });

    it("should handle all connection statuses", () => {
      const statuses = [
        "connected",
        "connecting",
        "disconnected",
        "error",
      ] as const;

      statuses.forEach((status) => {
        act(() => {
          useMarketStore.getState().setConnectionStatus(status);
        });

        expect(useMarketStore.getState().connectionStatus).toBe(status);
      });
    });
  });

  describe("Persistence", () => {
    it("should initialize with default values", () => {
      const state = useMarketStore.getState();

      expect(state.selectedSymbol).toBe("BTCUSDT");
      expect(state.timeInterval).toBe("1h");
      expect(state.favorites.has("BTCUSDT")).toBe(true);
      expect(state.favorites.has("ETHUSDT")).toBe(true);
      expect(state.connectionStatus).toBe("disconnected");
    });
  });

  describe("Store Isolation", () => {
    it("should not share state between different symbols", () => {
      act(() => {
        useMarketStore.getState().updateTicker("BTCUSDT", { price: 45000 });
      });

      act(() => {
        useMarketStore.getState().updateTicker("ETHUSDT", { price: 2400 });
      });

      const btcTicker = useMarketStore.getState().getTicker("BTCUSDT");
      const ethTicker = useMarketStore.getState().getTicker("ETHUSDT");

      expect(btcTicker?.price).toBe(45000);
      expect(ethTicker?.price).toBe(2400);
      expect(btcTicker).not.toEqual(ethTicker);
    });
  });
});
