import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    const binanceSymbol = symbol.replace("USDT", "") + "USDT";

    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      throw new Error(`Binance API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching ticker data:", error);

    const mockData = generateMockTickerData(symbol);
    return NextResponse.json(mockData);
  }
}

function generateMockTickerData(symbol: string) {
  const basePrices: { [key: string]: number } = {
    BTCUSDT: 45000,
    ETHUSDT: 2400,
    ADAUSDT: 0.45,
    DOTUSDT: 7.2,
    SOLUSDT: 98,
  };

  const basePrice = basePrices[symbol] || 100;
  const change = (Math.random() - 0.5) * basePrice * 0.1; // ±5%
  const changePercent = (change / basePrice) * 100;

  return {
    symbol: symbol,
    priceChange: change.toFixed(2),
    priceChangePercent: changePercent.toFixed(2),
    weightedAvgPrice: basePrice.toFixed(2),
    prevClosePrice: (basePrice - change).toFixed(2),
    lastPrice: basePrice.toFixed(2),
    lastQty: "1.00000000",
    bidPrice: (basePrice * 0.999).toFixed(2),
    bidQty: "10.00000000",
    askPrice: (basePrice * 1.001).toFixed(2),
    askQty: "10.00000000",
    openPrice: (basePrice - change).toFixed(2),
    highPrice: (basePrice * 1.02).toFixed(2),
    lowPrice: (basePrice * 0.98).toFixed(2),
    volume: (Math.random() * 1000000 + 500000).toFixed(2),
    quoteVolume: (Math.random() * 50000000 + 10000000).toFixed(2),
    openTime: Date.now() - 24 * 60 * 60 * 1000,
    closeTime: Date.now(),
    firstId: 1,
    lastId: 100,
    count: 100,
  };
}
