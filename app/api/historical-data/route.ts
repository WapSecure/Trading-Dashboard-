import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const interval = searchParams.get("interval") || "1h";
  const limit = searchParams.get("limit") || "100";

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    const binanceSymbol = symbol.replace('USDT', '') + 'USDT';
    
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`,
      {
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      throw new Error(`Binance API responded with status: ${response.status}`);
    }

    const data = await response.json();

    const formattedData = data.map((item: any[]) => ({
      timestamp: new Date(item[0]),
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5]),
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching historical data:", error);
    
    const mockData = generateMockHistoricalData(symbol, interval, parseInt(limit));
    
    return NextResponse.json(mockData);
  }
}

function generateMockHistoricalData(symbol: string, interval: string, limit: number) {
  const basePrices: { [key: string]: number } = {
    'BTCUSDT': 45000,
    'ETHUSDT': 2400,
    'ADAUSDT': 0.45,
    'DOTUSDT': 7.2,
    'SOLUSDT': 98,
  };
  
  const basePrice = basePrices[symbol] || 100;
  const data = [];
  const now = new Date();
  
  for (let i = limit - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    
    const volatility = basePrice * 0.02;
    const change = (Math.random() - 0.5) * volatility;
    
    const open = basePrice + (i === 0 ? 0 : change);
    const close = open + (Math.random() - 0.5) * volatility * 0.5;
    const high = Math.max(open, close) + Math.random() * volatility * 0.3;
    const low = Math.min(open, close) - Math.random() * volatility * 0.3;
    
    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume: Math.random() * 1000000 + 500000,
    });
  }
  
  return data;
}