export interface TickerData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    lastUpdate: Date;
  }
  
  export interface OrderBookData {
    bids: OrderLevel[];
    asks: OrderLevel[];
    spread: number;
    spreadPercent: number;
    lastUpdate: Date;
  }
  
  export interface OrderLevel {
    price: number;
    quantity: number;
    total: number;
  }
  
  export interface PriceHistory {
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }
  
  export type TimeInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  
  export interface WebSocketMessage {
    type: 'ticker' | 'orderbook' | 'kline';
    data: TickerData | OrderBookData | PriceHistory[];
  }