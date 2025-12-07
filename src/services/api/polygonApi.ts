import {
  Asset,
  AssetCategory,
  SearchResult,
  MarketDataPoint,
  ChartTimeframe,
  APIResponse,
} from '../../types';

/**
 * Polygon.io API Integration
 *
 * Free tier: 5 API calls per minute
 * Get your API key from: https://polygon.io/
 */

const POLYGON_BASE_URL = 'https://api.polygon.io';

// Get API key from environment variable
const getApiKey = (): string => {
  // In React Native, use expo-constants to access environment variables
  // For now, return empty string - will be configured by user
  return process.env.EXPO_PUBLIC_POLYGON_API_KEY || '';
};

/**
 * Map Polygon.io ticker type to AssetCategory
 */
function mapTickerType(type: string): AssetCategory {
  switch (type.toUpperCase()) {
    case 'CS':
    case 'COMMON STOCK':
      return AssetCategory.US_STOCKS;
    case 'CRYPTO':
      return AssetCategory.CRYPTO;
    case 'COMMODITY':
      return AssetCategory.COMMODITIES;
    default:
      return AssetCategory.US_STOCKS;
  }
}

/**
 * Search for assets (stocks, crypto)
 */
export async function searchAssetsPolygon(
  query: string,
  category?: AssetCategory
): Promise<APIResponse<SearchResult[]>> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'API key not configured. Please set EXPO_PUBLIC_POLYGON_API_KEY in your .env file',
    };
  }

  try {
    // Search for tickers
    const url = `${POLYGON_BASE_URL}/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&limit=10&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ERROR') {
      return {
        success: false,
        error: data.error || 'Failed to search assets',
      };
    }

    if (!data.results || data.results.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Get current prices for the tickers
    const results: SearchResult[] = [];

    for (const ticker of data.results) {
      // Filter by category if specified
      const tickerCategory = mapTickerType(ticker.type);
      if (category && tickerCategory !== category) {
        continue;
      }

      results.push({
        assetId: ticker.ticker,
        symbol: ticker.ticker,
        name: ticker.name,
        category: tickerCategory,
        currentPrice: undefined, // Will be fetched separately if needed
      });
    }

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search assets',
    };
  }
}

/**
 * Get asset details with current price
 */
export async function getAssetDetailsPolygon(
  symbol: string
): Promise<APIResponse<Asset>> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'API key not configured',
    };
  }

  try {
    // Get ticker details
    const detailsUrl = `${POLYGON_BASE_URL}/v3/reference/tickers/${symbol}?apiKey=${apiKey}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.status === 'ERROR' || !detailsData.results) {
      return {
        success: false,
        error: 'Asset not found',
      };
    }

    const ticker = detailsData.results;

    // Get current price (previous close as snapshot)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    const priceUrl = `${POLYGON_BASE_URL}/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${apiKey}`;
    const priceResponse = await fetch(priceUrl);
    const priceData = await priceResponse.json();

    let currentPrice = 0;
    let previousClose = 0;
    let dayHigh = 0;
    let dayLow = 0;
    let priceChange = 0;
    let priceChangePercent = 0;

    if (priceData.results && priceData.results.length > 0) {
      const result = priceData.results[0];
      currentPrice = result.c; // Close price
      previousClose = result.o; // Open price
      dayHigh = result.h;
      dayLow = result.l;
      priceChange = currentPrice - previousClose;
      priceChangePercent = previousClose > 0 ? (priceChange / previousClose) * 100 : 0;
    }

    const asset: Asset = {
      id: ticker.ticker,
      symbol: ticker.ticker,
      name: ticker.name,
      category: mapTickerType(ticker.type),
      currentPrice,
      previousClose,
      dayHigh,
      dayLow,
      priceChange,
      priceChangePercent,
      lastUpdated: new Date(),
    };

    return {
      success: true,
      data: asset,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch asset details',
    };
  }
}

/**
 * Get current price for an asset
 */
export async function getCurrentPricePolygon(
  symbol: string
): Promise<APIResponse<number>> {
  const response = await getAssetDetailsPolygon(symbol);

  if (!response.success || !response.data) {
    return {
      success: false,
      error: response.error,
    };
  }

  return {
    success: true,
    data: response.data.currentPrice,
  };
}

/**
 * Get current prices for multiple assets
 */
export async function getCurrentPricesPolygon(
  symbols: string[]
): Promise<APIResponse<Record<string, number>>> {
  const prices: Record<string, number> = {};

  // Note: Be careful with rate limits (5 calls/min on free tier)
  for (const symbol of symbols) {
    const response = await getCurrentPricePolygon(symbol);
    if (response.success && response.data) {
      prices[symbol] = response.data;
    }
  }

  return {
    success: true,
    data: prices,
  };
}

/**
 * Get chart data for an asset
 */
export async function getChartDataPolygon(
  symbol: string,
  timeframe: ChartTimeframe
): Promise<APIResponse<MarketDataPoint[]>> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'API key not configured',
    };
  }

  try {
    // Calculate date range and timespan based on timeframe
    let multiplier = 1;
    let timespan = 'hour';
    let from = new Date();
    const to = new Date();

    switch (timeframe) {
      case ChartTimeframe.ONE_DAY:
        multiplier = 1;
        timespan = 'hour';
        from.setDate(from.getDate() - 1);
        break;
      case ChartTimeframe.ONE_WEEK:
        multiplier = 1;
        timespan = 'day';
        from.setDate(from.getDate() - 7);
        break;
      case ChartTimeframe.ONE_MONTH:
        multiplier = 1;
        timespan = 'day';
        from.setMonth(from.getMonth() - 1);
        break;
      case ChartTimeframe.ONE_YEAR:
        multiplier = 1;
        timespan = 'week';
        from.setFullYear(from.getFullYear() - 1);
        break;
      case ChartTimeframe.ALL_TIME:
        multiplier = 1;
        timespan = 'month';
        from.setFullYear(from.getFullYear() - 5);
        break;
    }

    const fromStr = from.toISOString().split('T')[0];
    const toStr = to.toISOString().split('T')[0];

    const url = `${POLYGON_BASE_URL}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${fromStr}/${toStr}?adjusted=true&sort=asc&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ERROR' || !data.results) {
      return {
        success: false,
        error: 'Failed to fetch chart data',
      };
    }

    const dataPoints: MarketDataPoint[] = data.results.map((bar: any) => ({
      timestamp: bar.t,
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
    }));

    return {
      success: true,
      data: dataPoints,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch chart data',
    };
  }
}
