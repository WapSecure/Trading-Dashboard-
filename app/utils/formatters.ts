export const formatCurrency = (value: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };
  
  export const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toString();
  };
  
  export const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };
  
  export const generateOrderBookData = (symbol: string): any => {
    // Mock order book data for demonstration
    const basePrice = 45000; // BTC price
    const bids = [];
    const asks = [];
    
    for (let i = 0; i < 15; i++) {
      const bidPrice = basePrice * (1 - (i + 1) * 0.001);
      const askPrice = basePrice * (1 + (i + 1) * 0.001);
      
      bids.push({
        price: bidPrice,
        quantity: Math.random() * 10,
        total: 0,
      });
      
      asks.push({
        price: askPrice,
        quantity: Math.random() * 10,
        total: 0,
      });
    }
    
    // Calculate totals
    let bidTotal = 0;
    let askTotal = 0;
    
    bids.forEach(bid => {
      bidTotal += bid.quantity;
      bid.total = bidTotal;
    });
    
    asks.forEach(ask => {
      askTotal += ask.quantity;
      ask.total = askTotal;
    });
    
    const spread = asks[0].price - bids[0].price;
    const spreadPercent = (spread / bids[0].price) * 100;
    
    return {
      bids: bids.reverse(),
      asks,
      spread,
      spreadPercent,
      lastUpdate: new Date(),
    };
  };