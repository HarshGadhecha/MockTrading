import {
  Asset,
  AssetCategory,
  SearchResult,
  MarketDataPoint,
  ChartTimeframe,
  APIResponse,
} from '../../types';

/**
 * CoinGecko API Integration
 *
 * Free tier: No API key required for basic usage
 * Rate limit: 10-50 calls/minute depending on endpoint
 * Get API key for higher limits: https://www.coingecko.com/en/api/pricing
 */

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Get API key from environment variable (optional for free tier)
const getApiKey = (): string => {
  return process.env.EXPO_PUBLIC_COINGECKO_API_KEY || '';
};

/**
 * Search for cryptocurrencies
 */
export async function searchCryptoCoingecko(
  query: string
): Promise<APIResponse<SearchResult[]>> {
  try {
    const url = `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.coins || data.coins.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Get current prices for top 10 results
    const coinIds = data.coins.slice(0, 10).map((coin: any) => coin.id).join(',');
    const pricesUrl = `${COINGECKO_BASE_URL}/simple/price?ids=${coinIds}&vs_currencies=usd`;

    const pricesResponse = await fetch(pricesUrl);
    const pricesData = await pricesResponse.json();

    const results: SearchResult[] = data.coins.slice(0, 10).map((coin: any) => ({
      assetId: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      category: AssetCategory.CRYPTO,
      currentPrice: pricesData[coin.id]?.usd,
    }));

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search cryptocurrencies',
    };
  }
}

/**
 * Get crypto asset details with current price
 */
export async function getCryptoDetailsCoingecko(
  coinId: string
): Promise<APIResponse<Asset>> {
  try {
    const url = `${COINGECKO_BASE_URL}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return {
        success: false,
        error: 'Asset not found',
      };
    }

    const marketData = data.market_data;

    const asset: Asset = {
      id: data.id,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      category: AssetCategory.CRYPTO,
      currentPrice: marketData.current_price.usd,
      previousClose: marketData.current_price.usd - marketData.price_change_24h,
      dayHigh: marketData.high_24h.usd,
      dayLow: marketData.low_24h.usd,
      priceChange: marketData.price_change_24h,
      priceChangePercent: marketData.price_change_percentage_24h,
      lastUpdated: new Date(marketData.last_updated),
    };

    return {
      success: true,
      data: asset,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch crypto details',
    };
  }
}

/**
 * Get current price for a crypto asset
 */
export async function getCurrentCryptoPriceCoingecko(
  coinId: string
): Promise<APIResponse<number>> {
  try {
    const url = `${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data[coinId]) {
      return {
        success: false,
        error: 'Asset not found',
      };
    }

    return {
      success: true,
      data: data[coinId].usd,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch price',
    };
  }
}

/**
 * Get current prices for multiple crypto assets
 */
export async function getCurrentCryptoPricesCoingecko(
  coinIds: string[]
): Promise<APIResponse<Record<string, number>>> {
  try {
    const ids = coinIds.join(',');
    const url = `${COINGECKO_BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd`;

    const response = await fetch(url);
    const data = await response.json();

    const prices: Record<string, number> = {};
    for (const coinId of coinIds) {
      if (data[coinId]?.usd) {
        prices[coinId] = data[coinId].usd;
      }
    }

    return {
      success: true,
      data: prices,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch prices',
    };
  }
}

/**
 * Get chart data for a crypto asset
 */
export async function getCryptoChartDataCoingecko(
  coinId: string,
  timeframe: ChartTimeframe
): Promise<APIResponse<MarketDataPoint[]>> {
  try {
    // Map timeframe to CoinGecko days parameter
    let days = '1';
    switch (timeframe) {
      case ChartTimeframe.ONE_DAY:
        days = '1';
        break;
      case ChartTimeframe.ONE_WEEK:
        days = '7';
        break;
      case ChartTimeframe.ONE_MONTH:
        days = '30';
        break;
      case ChartTimeframe.ONE_YEAR:
        days = '365';
        break;
      case ChartTimeframe.ALL_TIME:
        days = 'max';
        break;
    }

    const url = `${COINGECKO_BASE_URL}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      return {
        success: false,
        error: 'Failed to fetch chart data',
      };
    }

    const dataPoints: MarketDataPoint[] = data.map((bar: any) => ({
      timestamp: bar[0],
      open: bar[1],
      high: bar[2],
      low: bar[3],
      close: bar[4],
      volume: 0, // OHLC endpoint doesn't provide volume
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
