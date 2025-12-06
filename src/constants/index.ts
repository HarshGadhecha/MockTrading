import { AssetCategory } from '../types';

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Mock Trading Portfolio',
  APP_VERSION: '1.0.0',
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_WALLET_BALANCE: 100000, // $100,000 virtual starting balance
  PRICE_REFRESH_INTERVAL: 10000, // 10 seconds
  DATABASE_NAME: 'mocktrading.db',
};

// Asset Category Display Names
export const ASSET_CATEGORY_NAMES: Record<AssetCategory, string> = {
  [AssetCategory.INDIAN_STOCKS]: 'Indian Stocks',
  [AssetCategory.US_STOCKS]: 'US Stocks',
  [AssetCategory.EUROPEAN_STOCKS]: 'European Stocks',
  [AssetCategory.COMMODITIES]: 'Commodities',
  [AssetCategory.CRYPTO]: 'Cryptocurrencies',
};

// Asset Category Icons (using Expo Vector Icons)
export const ASSET_CATEGORY_ICONS: Record<AssetCategory, string> = {
  [AssetCategory.INDIAN_STOCKS]: 'trending-up',
  [AssetCategory.US_STOCKS]: 'bar-chart',
  [AssetCategory.EUROPEAN_STOCKS]: 'globe',
  [AssetCategory.COMMODITIES]: 'cube',
  [AssetCategory.CRYPTO]: 'logo-bitcoin',
};

// Currency Symbols
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  BTC: '₿',
};

// Sell Percentage Options
export const SELL_PERCENTAGE_OPTIONS = [25, 50, 75, 100];

// Chart Timeframe Labels
export const CHART_TIMEFRAME_LABELS = {
  '1D': '1 Day',
  '1W': '1 Week',
  '1M': '1 Month',
  '1Y': '1 Year',
  'ALL': 'All Time',
};

// Transaction Limits
export const TRANSACTION_LIMITS = {
  MIN_INVESTMENT: 1,
  MAX_INVESTMENT: 1000000,
  MIN_QUANTITY: 0.00001,
};

// Date Formats
export const DATE_FORMATS = {
  FULL: 'MMM dd, yyyy HH:mm',
  DATE_ONLY: 'MMM dd, yyyy',
  TIME_ONLY: 'HH:mm',
  SHORT: 'MM/dd/yyyy',
};

// AdMob Configuration (Replace with your actual Ad Unit IDs)
export const ADMOB_CONFIG = {
  BANNER_AD_UNIT_ID_ANDROID: 'ca-app-pub-3940256099942544/6300978111', // Test ID
  BANNER_AD_UNIT_ID_IOS: 'ca-app-pub-3940256099942544/2934735716', // Test ID
  INTERSTITIAL_AD_UNIT_ID_ANDROID: 'ca-app-pub-3940256099942544/1033173712', // Test ID
  INTERSTITIAL_AD_UNIT_ID_IOS: 'ca-app-pub-3940256099942544/4411468910', // Test ID
  REWARDED_AD_UNIT_ID_ANDROID: 'ca-app-pub-3940256099942544/5224354917', // Test ID
  REWARDED_AD_UNIT_ID_IOS: 'ca-app-pub-3940256099942544/1712485313', // Test ID
};

// Rewarded Ad Bonus
export const REWARDED_AD_BONUS = {
  AMOUNT: 1000, // $1,000 bonus per rewarded ad
  DAILY_LIMIT: 5, // Maximum 5 rewarded ads per day
};

// Tab Navigation Icons
export const TAB_ICONS = {
  HOME: 'home',
  WISHLIST: 'heart',
  PORTFOLIO: 'briefcase',
  HISTORY: 'time',
  WALLET: 'wallet',
};

// Recent Activity Limit
export const RECENT_ACTIVITY_LIMIT = 10;

// Search Configuration
export const SEARCH_CONFIG = {
  MIN_SEARCH_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  MAX_RESULTS: 50,
};

// Notification Messages
export const MESSAGES = {
  BUY_SUCCESS: 'Asset purchased successfully!',
  SELL_SUCCESS: 'Asset sold successfully!',
  INSUFFICIENT_FUNDS: 'Insufficient virtual funds in wallet',
  INSUFFICIENT_QUANTITY: 'Insufficient quantity to sell',
  WALLET_ADDED: 'Virtual funds added to wallet',
  FAVOURITE_ADDED: 'Added to favourites',
  FAVOURITE_REMOVED: 'Removed from favourites',
  ERROR_GENERIC: 'An error occurred. Please try again.',
};

// API Configuration (Placeholder - Update with actual API endpoints)
export const API_CONFIG = {
  BASE_URL: 'https://api.example.com', // Replace with actual API
  ENDPOINTS: {
    SEARCH_ASSETS: '/search',
    GET_ASSET_DETAILS: '/asset',
    GET_MARKET_DATA: '/market-data',
    GET_CHART_DATA: '/chart',
  },
  TIMEOUT: 10000,
};

export * from './theme';
