import { PriceHistory, TimeInterval } from "@/app/types/market";

export async function fetchHistoricalData(
  symbol: string,
  interval: TimeInterval
): Promise<PriceHistory[]> {
  const response = await fetch(
    `/api/historical-data?symbol=${symbol}&interval=${interval}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch historical data");
  }

  return response.json();
}
