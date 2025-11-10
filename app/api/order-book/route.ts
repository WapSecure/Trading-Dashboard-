import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const limit = searchParams.get("limit") || "20";

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Binance API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching order book data:", error);
    
    const mockData = generateMockOrderBook(symbol);
    return NextResponse.json(mockData);
  }
}

function generateMockOrderBook(symbol: string) {
  const basePrices: { [key: string]: number } = {
    'BTCUSDT': 45000,
    'ETHUSDT': 2400,
    'ADAUSDT': 0.45,
    'DOTUSDT': 7.2,
    'SOLUSDT': 98,
  };
  
  const basePrice = basePrices[symbol] || 100;
  const bids = [];
  const asks = [];

  for (let i = 0; i < 20; i++) {
    const bidPrice = basePrice * (1 - (i + 1) * 0.001);
    const askPrice = basePrice * (1 + (i + 1) * 0.001);
    
    bids.push([
      bidPrice.toFixed(2),
      (Math.random() * 10 + 1).toFixed(4)
    ]);
    
    asks.push([
      askPrice.toFixed(2),
      (Math.random() * 10 + 1).toFixed(4)
    ]);
  }

  return {
    lastUpdateId: Date.now(),
    bids,
    asks
  };
}