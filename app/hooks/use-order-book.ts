import { useQuery } from "@tanstack/react-query";
import { OrderBookData } from "@/app/types/market";

export const useOrderBook = (symbol: string) => {
  return useQuery({
    queryKey: ["order-book", symbol],
    queryFn: async (): Promise<OrderBookData> => {
      const response = await fetch(`/api/order-book?symbol=${symbol}&limit=20`);

      if (!response.ok) {
        throw new Error("Failed to fetch order book data");
      }

      const data = await response.json();

      const bids = data.bids.map(([price, quantity]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        total: 0,
      }));

      const asks = data.asks.map(([price, quantity]: [string, string]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        total: 0,
      }));

      let bidTotal = 0;
      let askTotal = 0;

      bids.forEach((bid: any) => {
        bidTotal += bid.quantity;
        bid.total = bidTotal;
      });

      asks.forEach((ask: any) => {
        askTotal += ask.quantity;
        ask.total = askTotal;
      });

      const spread = asks[0]?.price - bids[0]?.price || 0;
      const spreadPercent = bids[0]?.price ? (spread / bids[0].price) * 100 : 0;

      return {
        bids: bids.reverse(),
        asks,
        spread,
        spreadPercent,
        lastUpdate: new Date(),
      };
    },
    refetchInterval: 5000,
    staleTime: 2000,
  });
};
