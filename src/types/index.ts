// Asset Category Types
export enum AssetCategory {
  INDIAN_STOCKS = 'indian_stocks',
  US_STOCKS = 'us_stocks',
  EUROPEAN_STOCKS = 'european_stocks',
  COMMODITIES = 'commodities',
  CRYPTO = 'crypto',
}

// Transaction Types
export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell',
}

// Chart Timeframe Types
export enum ChartTimeframe {
  ONE_DAY = '1D',
  ONE_WEEK = '1W',
  ONE_MONTH = '1M',
  ONE_YEAR = '1Y',
  ALL_TIME = 'ALL',
}

// Asset Interface
export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  currentPrice: number;
  previousClose?: number;
  dayHigh?: number;
  dayLow?: number;
  priceChange?: number;
  priceChangePercent?: number;
  marketCap?: number;
  volume?: number;
  lastUpdated: Date;
}

// Favourite Asset Interface
export interface FavouriteAsset {
  id: number;
  assetId: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  addedAt: Date;
}

// Transaction Interface
export interface Transaction {
  id: number;
  assetId: string;
  assetSymbol: string;
  assetName: string;
  category: AssetCategory;
  type: TransactionType;
  price: number;
  quantity: number;
  amount: number;
  timestamp: Date;
  notes?: string;
}

// Portfolio Holding Interface
export interface PortfolioHolding {
  id: number;
  assetId: string;
  assetSymbol: string;
  assetName: string;
  category: AssetCategory;
  totalQuantity: number;
  averageEntryPrice: number;
  totalInvested: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  firstPurchaseDate: Date;
  lastUpdated: Date;
}

// Wallet Interface
export interface Wallet {
  id: number;
  totalFundsAdded: number;
  totalFundsUsed: number;
  currentBalance: number;
  lastUpdated: Date;
}

// Wallet Transaction Interface
export interface WalletTransaction {
  id: number;
  type: 'add' | 'deduct';
  amount: number;
  description: string;
  timestamp: Date;
  balanceAfter: number;
}

// Portfolio Summary Interface
export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  totalHoldings: number;
}

// Market Data Point (for charts)
export interface MarketDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Chart Data Interface
export interface ChartData {
  timeframe: ChartTimeframe;
  data: MarketDataPoint[];
}

// Buy Form Data
export interface BuyFormData {
  assetId: string;
  assetSymbol: string;
  assetName: string;
  category: AssetCategory;
  entryPrice: number;
  investmentAmount: number;
  quantity: number;
}

// Sell Form Data
export interface SellFormData {
  assetId: string;
  assetSymbol: string;
  assetName: string;
  category: AssetCategory;
  exitPrice: number;
  exitAmount?: number;
  exitQuantity?: number;
  exitPercentage?: number;
}

// Sell Method Type
export enum SellMethod {
  PERCENTAGE = 'percentage',
  AMOUNT = 'amount',
  QUANTITY = 'quantity',
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Search Result Interface
export interface SearchResult {
  assetId: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  currentPrice?: number;
  exchange?: string;
}

// Database Row Types
export interface AssetRow {
  id: string;
  symbol: string;
  name: string;
  category: string;
  current_price: number;
  previous_close: number | null;
  day_high: number | null;
  day_low: number | null;
  price_change: number | null;
  price_change_percent: number | null;
  last_updated: string;
}

export interface TransactionRow {
  id: number;
  asset_id: string;
  asset_symbol: string;
  asset_name: string;
  category: string;
  type: string;
  price: number;
  quantity: number;
  amount: number;
  timestamp: string;
  notes: string | null;
}

export interface PortfolioRow {
  id: number;
  asset_id: string;
  asset_symbol: string;
  asset_name: string;
  category: string;
  total_quantity: number;
  average_entry_price: number;
  total_invested: number;
  first_purchase_date: string;
  last_updated: string;
}

export interface FavouriteRow {
  id: number;
  asset_id: string;
  symbol: string;
  name: string;
  category: string;
  added_at: string;
}

export interface WalletRow {
  id: number;
  total_funds_added: number;
  total_funds_used: number;
  current_balance: number;
  last_updated: string;
}

export interface WalletTransactionRow {
  id: number;
  type: string;
  amount: number;
  description: string;
  timestamp: string;
  balance_after: number;
}
