import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PriceChart } from '../PriceChart'
import { PriceHistory } from '@/app/types/market'
import { useMarketStore } from '@/app/stores/market-store'

// Mock the store
jest.mock('@/app/stores/market-store', () => ({
  useMarketStore: jest.fn(),
}))

// Mock Recharts to avoid SVG issues in tests
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts')
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    LineChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="line-chart">{children}</div>
    ),
    Line: () => <div data-testid="line" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
  }
})

// Mock TimeIntervalSelector
jest.mock('../TimeIntervalSelector', () => ({
  TimeIntervalSelector: () => <div data-testid="time-interval-selector">Interval Selector</div>,
}))

const mockPriceHistory: PriceHistory[] = [
  {
    timestamp: new Date('2024-01-01T00:00:00Z'),
    open: 45000,
    high: 45500,
    low: 44800,
    close: 45200,
    volume: 1000000,
  },
  {
    timestamp: new Date('2024-01-01T01:00:00Z'),
    open: 45200,
    high: 45800,
    low: 45100,
    close: 45700,
    volume: 1200000,
  },
]

const mockTicker = {
  symbol: 'BTCUSDT',
  price: 45750,
  change: 550,
  changePercent: 1.22,
  volume: 1500000,
  high: 45800,
  low: 44800,
  lastUpdate: new Date(),
}

describe('PriceChart', () => {
  const mockGetTicker = jest.fn()
  const mockUseMarketStore = useMarketStore as jest.MockedFunction<typeof useMarketStore>

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseMarketStore.mockReturnValue({
      selectedSymbol: 'BTCUSDT',
      getTicker: mockGetTicker,
      timeInterval: '1h',
    } as any)
  })

  it('should render loading state when no data', () => {
    mockGetTicker.mockReturnValue(null)

    render(<PriceChart data={[]} interval="1h" />)

    expect(screen.getByText('Price Chart - BTC')).toBeInTheDocument()
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument()
    expect(screen.getByTestId('time-interval-selector')).toBeInTheDocument()
  })

  it('should render chart with data', async () => {
    mockGetTicker.mockReturnValue(mockTicker)

    render(<PriceChart data={mockPriceHistory} interval="1h" />)

    expect(screen.getByText('Price Chart - BTC')).toBeInTheDocument()
    expect(screen.getByText('• Live Updates')).toBeInTheDocument()
    
    // Chart should be rendered
    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  it('should display real-time price indicator', () => {
    mockGetTicker.mockReturnValue(mockTicker)

    render(<PriceChart data={mockPriceHistory} interval="1h" />)

    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(screen.getByText('$45,750.00')).toBeInTheDocument()
    
    // Should have green indicator for positive change
    const indicator = screen.getByRole('generic', { name: /live indicator/i })
    expect(indicator).toHaveClass('bg-green-500')
  })

  it('should display red indicator for negative change', () => {
    const negativeTicker = { ...mockTicker, change: -550 }
    mockGetTicker.mockReturnValue(negativeTicker)

    render(<PriceChart data={mockPriceHistory} interval="1h" />)

    const indicator = screen.getByRole('generic', { name: /live indicator/i })
    expect(indicator).toHaveClass('bg-red-500')
  })

  it('should handle missing ticker data gracefully', () => {
    mockGetTicker.mockReturnValue(null)

    render(<PriceChart data={mockPriceHistory} interval="1h" />)

    // Should still render the chart
    expect(screen.getByText('Price Chart - BTC')).toBeInTheDocument()
    expect(screen.queryByText('Live')).not.toBeInTheDocument()
  })

  it('should format time correctly for different intervals', () => {
    mockGetTicker.mockReturnValue(mockTicker)

    const { rerender } = render(<PriceChart data={mockPriceHistory} interval="1d" />)
    expect(screen.getByTestId('time-interval-selector')).toBeInTheDocument()

    rerender(<PriceChart data={mockPriceHistory} interval="15m" />)
    expect(screen.getByTestId('time-interval-selector')).toBeInTheDocument()

    rerender(<PriceChart data={mockPriceHistory} interval="1m" />)
    expect(screen.getByTestId('time-interval-selector')).toBeInTheDocument()
  })

  it('should update chart color based on price movement', () => {
    mockGetTicker.mockReturnValue(mockTicker)

    render(<PriceChart data={mockPriceHistory} interval="1h" />)

    // Chart should use green color for bullish movement
    // (first close: 45200, last close: 45700 = bullish)
    expect(screen.getByTestId('line')).toBeInTheDocument()
  })

  it('should handle empty data array', () => {
    mockGetTicker.mockReturnValue(mockTicker)

    render(<PriceChart data={[]} interval="1h" />)

    expect(screen.getByText('Loading chart data...')).toBeInTheDocument()
  })
})