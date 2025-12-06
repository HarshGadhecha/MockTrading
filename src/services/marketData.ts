import {
  Asset,
  AssetCategory,
  SearchResult,
  MarketDataPoint,
  ChartTimeframe,
  APIResponse,
} from '../types';

/**
 * Mock Market Data Service
 *
 * NOTE: This is a placeholder implementation with mock data.
 * Replace these functions with actual API calls to a market data provider.
 *
 * Recommended APIs:
 * - Alpha Vantage (stocks, forex, crypto)
 * - Polygon.io (stocks, crypto)
 * - CoinGecko (crypto)
 * - Yahoo Finance API
 * - Finnhub (stocks, forex, crypto)
 */

// Mock data generator
function generateMockPrice(basePrice: number, volatility: number = 0.02): number {
  const change = basePrice * volatility * (Math.random() - 0.5) * 2;
  return Math.max(basePrice + change, 0.01);
}

// Mock asset database
const MOCK_ASSETS: Record<string, Asset> = {
  'AAPL': {
    id: 'AAPL',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: AssetCategory.US_STOCKS,
    currentPrice: 175.50,
    previousClose: 174.20,
    dayHigh: 176.80,
    dayLow: 174.00,
    priceChange: 1.30,
    priceChangePercent: 0.75,
    lastUpdated: new Date(),
  },
  'GOOGL': {
    id: 'GOOGL',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    category: AssetCategory.US_STOCKS,
    currentPrice: 140.25,
    previousClose: 139.50,
    dayHigh: 141.00,
    dayLow: 139.00,
    priceChange: 0.75,
    priceChangePercent: 0.54,
    lastUpdated: new Date(),
  },
  'BTC': {
    id: 'BTC',
    symbol: 'BTC',
    name: 'Bitcoin',
    category: AssetCategory.CRYPTO,
    currentPrice: 42500.00,
    previousClose: 42000.00,
    dayHigh: 43000.00,
    dayLow: 41800.00,
    priceChange: 500.00,
    priceChangePercent: 1.19,
    lastUpdated: new Date(),
  },
  'ETH': {
    id: 'ETH',
    symbol: 'ETH',
    name: 'Ethereum',
    category: AssetCategory.CRYPTO,
    currentPrice: 2250.00,
    previousClose: 2200.00,
    dayHigh: 2280.00,
    dayLow: 2180.00,
    priceChange: 50.00,
    priceChangePercent: 2.27,
    lastUpdated: new Date(),
  },
  'RELIANCE': {
    id: 'RELIANCE',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    category: AssetCategory.INDIAN_STOCKS,
    currentPrice: 2450.00,
    previousClose: 2430.00,
    dayHigh: 2465.00,
    dayLow: 2425.00,
    priceChange: 20.00,
    priceChangePercent: 0.82,
    lastUpdated: new Date(),
  },
  'GOLD': {
    id: 'GOLD',
    symbol: 'GOLD',
    name: 'Gold',
    category: AssetCategory.COMMODITIES,
    currentPrice: 2050.00,
    previousClose: 2045.00,
    dayHigh: 2055.00,
    dayLow: 2042.00,
    priceChange: 5.00,
    priceChangePercent: 0.24,
    lastUpdated: new Date(),
  },
};

/**
 * Search for assets
 */
export async function searchAssets(
  query: string,
  category?: AssetCategory
): Promise<APIResponse<SearchResult[]>> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const results = Object.values(MOCK_ASSETS)
      .filter((asset) => {
        const matchesQuery =
          asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
          asset.name.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = !category || asset.category === category;
        return matchesQuery && matchesCategory;
      })
      .map((asset) => ({
        assetId: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        category: asset.category,
        currentPrice: asset.currentPrice,
      }));

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to search assets',
    };
  }
}

/**
 * Get asset details by ID
 */
export async function getAssetDetails(
  assetId: string
): Promise<APIResponse<Asset>> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const asset = MOCK_ASSETS[assetId];
    if (!asset) {
      return {
        success: false,
        error: 'Asset not found',
      };
    }

    // Generate slightly different price to simulate real-time updates
    const updatedAsset = {
      ...asset,
      currentPrice: generateMockPrice(asset.currentPrice),
      lastUpdated: new Date(),
    };

    return {
      success: true,
      data: updatedAsset,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch asset details',
    };
  }
}

/**
 * Get current price for an asset
 */
export async function getCurrentPrice(
  assetId: string
): Promise<APIResponse<number>> {
  try {
    const response = await getAssetDetails(assetId);
    if (!response.success || !response.data) {
      return {
        success: false,
        error: 'Failed to fetch price',
      };
    }

    return {
      success: true,
      data: response.data.currentPrice,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch price',
    };
  }
}

/**
 * Get current prices for multiple assets
 */
export async function getCurrentPrices(
  assetIds: string[]
): Promise<APIResponse<Record<string, number>>> {
  try {
    const prices: Record<string, number> = {};

    for (const assetId of assetIds) {
      const response = await getCurrentPrice(assetId);
      if (response.success && response.data) {
        prices[assetId] = response.data;
      }
    }

    return {
      success: true,
      data: prices,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch prices',
    };
  }
}

/**
 * Get chart data for an asset
 */
export async function getChartData(
  assetId: string,
  timeframe: ChartTimeframe
): Promise<APIResponse<MarketDataPoint[]>> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const asset = MOCK_ASSETS[assetId];
    if (!asset) {
      return {
        success: false,
        error: 'Asset not found',
      };
    }

    // Generate mock chart data
    const dataPoints = generateMockChartData(
      asset.currentPrice,
      timeframe
    );

    return {
      success: true,
      data: dataPoints,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch chart data',
    };
  }
}

/**
 * Generate mock chart data
 */
function generateMockChartData(
  currentPrice: number,
  timeframe: ChartTimeframe
): MarketDataPoint[] {
  const points: MarketDataPoint[] = [];
  let numPoints = 30;
  let intervalMs = 60000; // 1 minute

  switch (timeframe) {
    case ChartTimeframe.ONE_DAY:
      numPoints = 24;
      intervalMs = 3600000; // 1 hour
      break;
    case ChartTimeframe.ONE_WEEK:
      numPoints = 7;
      intervalMs = 86400000; // 1 day
      break;
    case ChartTimeframe.ONE_MONTH:
      numPoints = 30;
      intervalMs = 86400000; // 1 day
      break;
    case ChartTimeframe.ONE_YEAR:
      numPoints = 12;
      intervalMs = 2592000000; // ~30 days
      break;
    case ChartTimeframe.ALL_TIME:
      numPoints = 50;
      intervalMs = 7776000000; // ~90 days
      break;
  }

  const now = Date.now();
  let price = currentPrice * 0.95; // Start slightly lower

  for (let i = 0; i < numPoints; i++) {
    const timestamp = now - (numPoints - i - 1) * intervalMs;
    const open = price;
    const volatility = 0.02;
    const change = price * volatility * (Math.random() - 0.5);
    const close = price + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);

    points.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000),
    });

    price = close;
  }

  return points;
}

/**
 * Get trending assets
 */
export async function getTrendingAssets(
  limit: number = 10
): Promise<APIResponse<Asset[]>> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const trending = Object.values(MOCK_ASSETS)
      .sort((a, b) => {
        const changeA = Math.abs(a.priceChangePercent || 0);
        const changeB = Math.abs(b.priceChangePercent || 0);
        return changeB - changeA;
      })
      .slice(0, limit);

    return {
      success: true,
      data: trending,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch trending assets',
    };
  }
}
