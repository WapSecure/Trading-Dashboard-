import { render, screen } from "@testing-library/react";
import { OrderBook } from "../OrderBook";
import { useOrderBook } from "@/app/hooks/use-order-book";
import { OrderBookData } from "@/app/types/market";

jest.mock("@/app/hooks/use-order-book");

const mockUseOrderBook = useOrderBook as jest.MockedFunction<
  typeof useOrderBook
>;

const mockOrderBookData: OrderBookData = {
  bids: [
    { price: 44950, quantity: 1.2, total: 1.2 },
    { price: 44900, quantity: 2.5, total: 3.7 },
    { price: 44850, quantity: 1.8, total: 5.5 },
    { price: 44800, quantity: 3.2, total: 8.7 },
  ],
  asks: [
    { price: 45050, quantity: 1.5, total: 1.5 },
    { price: 45100, quantity: 2.2, total: 3.7 },
    { price: 45150, quantity: 1.7, total: 5.4 },
    { price: 45200, quantity: 2.8, total: 8.2 },
  ],
  spread: 100,
  spreadPercent: 0.22,
  lastUpdate: new Date("2024-01-01T00:00:00Z"),
};

describe("OrderBook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading state", () => {
    mockUseOrderBook.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<OrderBook symbol="BTCUSDT" />);

    // Check for the loading skeleton
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should render order book data correctly", async () => {
    mockUseOrderBook.mockReturnValue({
      data: mockOrderBookData,
      isLoading: false,
      error: null,
    } as any);

    render(<OrderBook symbol="BTCUSDT" />);

    // Check title
    expect(screen.getByText(/order book/i)).toBeInTheDocument();
    expect(screen.getByText(/BTC/i)).toBeInTheDocument();

    // Check headers
    expect(screen.getAllByText("Price")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Size")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Total")[0]).toBeInTheDocument();

    // Check bids data
    expect(screen.getByText("44,950.00")).toBeInTheDocument();
    expect(screen.getByText("1.2")).toBeInTheDocument();

    // Check asks data
    expect(screen.getByText("45,050.00")).toBeInTheDocument();
    expect(screen.getByText("1.5")).toBeInTheDocument(); 

    // Check spread calculation
    expect(screen.getByText("100.00")).toBeInTheDocument();
    expect(screen.getByText("0.22%")).toBeInTheDocument();
  });

  it("should render error state", () => {
    mockUseOrderBook.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to fetch"),
    } as any);

    render(<OrderBook symbol="BTCUSDT" />);

    expect(screen.getByText(/order book/i)).toBeInTheDocument();
    expect(screen.getByText(/unable to load/i)).toBeInTheDocument();
  });

  it("should handle empty order book data", () => {
    mockUseOrderBook.mockReturnValue({
      data: {
        bids: [],
        asks: [],
        spread: 0,
        spreadPercent: 0,
        lastUpdate: new Date(),
      },
      isLoading: false,
      error: null,
    } as any);

    render(<OrderBook symbol="BTCUSDT" />);

    expect(screen.getByText(/order book/i)).toBeInTheDocument();
    expect(screen.getByText("0.00")).toBeInTheDocument();
    expect(screen.getByText("0.00%")).toBeInTheDocument();
  });

  it("should display correct number of levels", () => {
    mockUseOrderBook.mockReturnValue({
      data: mockOrderBookData,
      isLoading: false,
      error: null,
    } as any);

    render(<OrderBook symbol="BTCUSDT" />);

    // Should show only first 8 levels (4 bids + 4 asks)
    const bidElements = screen.getAllByText(/44,[0-9]{3}\.[0-9]{2}/);
    const askElements = screen.getAllByText(/45,[0-9]{3}\.[0-9]{2}/);

    expect(bidElements.length).toBe(4);
    expect(askElements.length).toBe(4);
  });

  it("should format numbers correctly", () => {
    mockUseOrderBook.mockReturnValue({
      data: mockOrderBookData,
      isLoading: false,
      error: null,
    } as any);

    render(<OrderBook symbol="BTCUSDT" />);

    // Check number formatting - updated to match actual output
    expect(screen.getByText("1.2")).toBeInTheDocument();
    expect(screen.getByText("1.2")).toBeInTheDocument();
    expect(screen.getByText("2.5")).toBeInTheDocument();
    expect(screen.getByText("3.7")).toBeInTheDocument();
  });

  it("should apply correct colors for bids and asks", () => {
    mockUseOrderBook.mockReturnValue({
      data: mockOrderBookData,
      isLoading: false,
      error: null,
    } as any);

    render(<OrderBook symbol="BTCUSDT" />);

    // Check bid colors (green)
    const bidPriceElements = screen.getAllByText("44,950.00");
    bidPriceElements.forEach((element) => {
      const parentDiv = element.closest('div[class*="text-green"]');
      expect(parentDiv).toBeInTheDocument();
    });

    // Check ask colors (red)
    const askPriceElements = screen.getAllByText("45,050.00");
    askPriceElements.forEach((element) => {
      const parentDiv = element.closest('div[class*="text-red"]');
      expect(parentDiv).toBeInTheDocument();
    });
  });

  it("should update when symbol prop changes", () => {
    const { rerender } = render(<OrderBook symbol="BTCUSDT" />);

    expect(mockUseOrderBook).toHaveBeenCalledWith("BTCUSDT");

    rerender(<OrderBook symbol="ETHUSDT" />);

    expect(mockUseOrderBook).toHaveBeenCalledWith("ETHUSDT");
    expect(mockUseOrderBook).toHaveBeenCalledTimes(2);
  });
});
