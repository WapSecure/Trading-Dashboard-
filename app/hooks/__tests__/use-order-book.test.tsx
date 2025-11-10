import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOrderBook } from "../use-order-book";

global.fetch = jest.fn();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useOrderBook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it("should fetch order book data successfully", async () => {
    const mockOrderBookData = {
      bids: [
        { price: 44900, quantity: 2.0, total: 3.5 },
        { price: 45000, quantity: 1.5, total: 1.5 },
      ],
      asks: [
        { price: 45100, quantity: 1.2, total: 1.2 },
        { price: 45200, quantity: 1.8, total: 3.0 },
      ],
      spread: 100,
      spreadPercent: 0.2222222222222222,
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        bids: [
          ["44900", "2.0"],
          ["45000", "1.5"],
        ],
        asks: [
          ["45100", "1.2"],
          ["45200", "1.8"],
        ],
      }),
    });

    const { result } = renderHook(() => useOrderBook("BTCUSDT"), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Check structure without checking lastUpdate (which is dynamic)
    expect(result.current.data?.bids).toEqual(mockOrderBookData.bids);
    expect(result.current.data?.asks).toEqual(mockOrderBookData.asks);
    expect(result.current.data?.spread).toBe(mockOrderBookData.spread);
    expect(result.current.data?.spreadPercent).toBe(
      mockOrderBookData.spreadPercent
    );
    expect(result.current.data?.lastUpdate).toBeInstanceOf(Date);
    expect(fetch).toHaveBeenCalledWith(
      "/api/order-book?symbol=BTCUSDT&limit=20"
    );
  });

  it("should handle API errors gracefully", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useOrderBook("BTCUSDT"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });

  it("should refetch data at intervals", async () => {
    jest.useFakeTimers();
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          bids: [["45000", "1.5"]],
          asks: [["45100", "1.2"]],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          bids: [["45050", "1.6"]],
          asks: [["45150", "1.3"]],
        }),
      });

    const { result } = renderHook(() => useOrderBook("BTCUSDT"), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const firstData = result.current.data;

    // Advance timers to trigger refetch
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    const secondData = result.current.data;

    // Check that data has changed (different prices)
    expect(firstData?.bids[0].price).toBe(45000);
    expect(secondData?.bids[0].price).toBe(45050);
    expect(firstData).not.toEqual(secondData);

    jest.useRealTimers();
  });

  it("should calculate spread correctly", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        bids: [
          ["45000", "1.5"],
          ["44900", "2.0"],
        ],
        asks: [
          ["45100", "1.2"],
          ["45200", "1.8"],
        ],
      }),
    });

    const { result } = renderHook(() => useOrderBook("BTCUSDT"), { wrapper });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data?.spread).toBe(100);
    expect(result.current.data?.spreadPercent).toBeCloseTo(0.2222, 2);
  });

  it("should handle empty order book data", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        bids: [],
        asks: [],
      }),
    });

    const { result } = renderHook(() => useOrderBook("BTCUSDT"), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.bids).toEqual([]);
    expect(result.current.data?.asks).toEqual([]);
    expect(result.current.data?.spread).toBe(0);
    expect(result.current.data?.spreadPercent).toBe(0);
  });
});
