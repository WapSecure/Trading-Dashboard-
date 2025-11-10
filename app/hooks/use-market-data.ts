import { useQuery } from "@tanstack/react-query";
import { PriceHistory, TimeInterval } from "@/app/types/market";

export const usePriceHistory = (symbol: string, interval: TimeInterval) => {
  return useQuery({
    queryKey: ["price-history", symbol, interval],
    queryFn: async (): Promise<PriceHistory[]> => {
      const response = await fetch(
        `/api/historical-data?symbol=${symbol}&interval=${interval}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch historical data");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });
};
