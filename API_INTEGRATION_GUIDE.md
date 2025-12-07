# API Integration Guide - MockTrading App

This guide explains how to integrate real market data APIs into your MockTrading app to get live stock and cryptocurrency prices.

## Table of Contents

1. [Overview](#overview)
2. [Available APIs](#available-apis)
3. [Quick Start](#quick-start)
4. [API Setup Instructions](#api-setup-instructions)
5. [Configuration](#configuration)
6. [Features Enabled](#features-enabled)
7. [Rate Limits & Costs](#rate-limits--costs)
8. [Troubleshooting](#troubleshooting)
9. [Alternative APIs](#alternative-apis)

---

## Overview

The app supports multiple market data providers:

- **Polygon.io** - For stocks, forex, and crypto (Requires API key)
- **CoinGecko** - For cryptocurrencies (Free, no API key required)

The app automatically falls back to mock data if APIs are not configured or fail.

---

## Available APIs

### 1. Polygon.io (Recommended for Stocks)

- **What it provides**: US stocks, crypto, forex, commodities
- **Free tier**: 5 API calls per minute
- **Paid plans**: Starting at $29/month for unlimited calls
- **Best for**: Comprehensive stock market data
- **Website**: https://polygon.io/

### 2. CoinGecko (Recommended for Crypto)

- **What it provides**: Cryptocurrencies
- **Free tier**: 10-50 calls/minute (no API key needed)
- **Paid plans**: Starting at $129/month for higher limits
- **Best for**: Cryptocurrency prices and data
- **Website**: https://www.coingecko.com/

### 3. Alternative Options

See [Alternative APIs](#alternative-apis) section below for more options.

---

## Quick Start

### Step 1: Get API Keys

#### For Polygon.io (Stocks):

1. Go to https://polygon.io/
2. Click "Get Free API Key" or "Sign Up"
3. Create an account with your email
4. Verify your email address
5. Go to your Dashboard
6. Copy your API Key (looks like: `YOUR_API_KEY_HERE`)

#### For CoinGecko (Crypto) - OPTIONAL:

CoinGecko works without an API key! But if you want higher rate limits:

1. Go to https://www.coingecko.com/en/api/pricing
2. Choose a plan (or use free tier)
3. Get your API key from the dashboard

### Step 2: Configure Environment Variables

1. Create a `.env` file in the root of your project:

```bash
# In the root directory of MockTrading
touch .env
```

2. Add your API keys to the `.env` file:

```env
# Enable real API mode
EXPO_PUBLIC_USE_REAL_API=true

# Polygon.io API Key (for stocks)
EXPO_PUBLIC_POLYGON_API_KEY=your_polygon_api_key_here

# CoinGecko API Key (optional - works without it)
EXPO_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key_here
```

3. **IMPORTANT**: Add `.env` to your `.gitignore` to keep your API keys secret:

```bash
echo ".env" >> .gitignore
```

### Step 3: Install Required Dependencies

```bash
# Install expo-constants to read environment variables
npm install expo-constants

# Or with yarn
yarn add expo-constants
```

### Step 4: Restart Your App

```bash
# Clear cache and restart
npx expo start -c
```

---

## API Setup Instructions

### Detailed Polygon.io Setup

1. **Create Account**:
   - Visit https://polygon.io/
   - Click "Get Free API Key"
   - Enter your email and create password
   - Verify email

2. **Get API Key**:
   - Login to your dashboard
   - Navigate to "API Keys" section
   - Copy your default API key
   - Or create a new one if needed

3. **Test Your Key**:
   ```bash
   # Replace YOUR_KEY with your actual API key
   curl "https://api.polygon.io/v2/aggs/ticker/AAPL/prev?apiKey=YOUR_KEY"
   ```

4. **Add to .env file**:
   ```env
   EXPO_PUBLIC_POLYGON_API_KEY=YOUR_KEY
   ```

### Detailed CoinGecko Setup

1. **Free Tier (No API Key)**:
   - Just enable real API mode in `.env`:
   ```env
   EXPO_PUBLIC_USE_REAL_API=true
   ```
   - CoinGecko will work automatically!

2. **With API Key (Optional)**:
   - Visit https://www.coingecko.com/en/api/pricing
   - Choose a plan
   - Get your API key
   - Add to `.env`:
   ```env
   EXPO_PUBLIC_COINGECKO_API_KEY=YOUR_KEY
   ```

3. **Test Your Setup**:
   ```bash
   # This works without API key
   curl "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
   ```

---

## Configuration

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXPO_PUBLIC_USE_REAL_API` | No | `false` | Enable/disable real API mode |
| `EXPO_PUBLIC_POLYGON_API_KEY` | For stocks | - | Your Polygon.io API key |
| `EXPO_PUBLIC_COINGECKO_API_KEY` | No | - | Your CoinGecko API key (optional) |

### Example .env File

```env
# Enable real APIs
EXPO_PUBLIC_USE_REAL_API=true

# Polygon.io for stocks (Required for stock data)
EXPO_PUBLIC_POLYGON_API_KEY=abc123xyz456

# CoinGecko for crypto (Optional - works without it)
# EXPO_PUBLIC_COINGECKO_API_KEY=optional_key_here
```

### Switching Between Mock and Real Data

To use **REAL APIs**:
```env
EXPO_PUBLIC_USE_REAL_API=true
```

To use **MOCK DATA** (for testing/development):
```env
EXPO_PUBLIC_USE_REAL_API=false
```

---

## Features Enabled

Once APIs are configured, you get:

### ✅ Real-Time Asset Search

- Search for **ANY** stock ticker (AAPL, GOOGL, TSLA, etc.)
- Search for **ANY** cryptocurrency (bitcoin, ethereum, solana, etc.)
- Get live prices in search results

### ✅ Live Price Updates

- Asset detail pages refresh every 5 seconds
- See real-time price changes
- Live profit/loss calculations

### ✅ Historical Charts

- View price charts for different timeframes:
  - 1 Day
  - 1 Week
  - 1 Month
  - 1 Year
  - All Time

### ✅ Market Statistics

- Current price
- Previous close
- Day high/low
- 24h price change
- Percentage change

---

## Rate Limits & Costs

### Polygon.io

**Free Tier**:
- 5 API calls per minute
- Delayed data (15 minutes)
- Perfect for testing and small apps

**Starter Plan ($29/month)**:
- Unlimited API calls
- Real-time data
- Advanced features

**Impact on App**:
- Each asset search = 1-2 calls
- Each price update = 1 call
- Chart data = 1 call
- With 5 calls/min, you can:
  - View ~2-3 assets with live updates per minute
  - Search for assets carefully

### CoinGecko

**Free Tier (No API Key)**:
- 10-50 calls/minute
- Perfect for crypto data
- No credit card required

**Pro Plan ($129/month)**:
- 500 calls/minute
- Priority support
- Advanced data

**Impact on App**:
- Crypto search is FREE
- Live crypto prices are FREE
- Works great without API key!

### Tips to Stay Within Limits

1. **Use Mock Data for Development**:
   ```env
   EXPO_PUBLIC_USE_REAL_API=false
   ```

2. **Increase Update Interval**:
   - Default: Updates every 5 seconds
   - Change in `app/asset/[id].tsx`:
   ```typescript
   // Change from 5000 to 10000 (10 seconds)
   const interval = setInterval(() => {
     loadAssetData(false);
   }, 10000); // 10 seconds instead of 5
   ```

3. **Use CoinGecko for Crypto**:
   - It's free and generous with rate limits

4. **Upgrade Plans**:
   - If you need more, both services have affordable plans

---

## Troubleshooting

### Issue: "API key not configured" Error

**Solution**:
1. Check `.env` file exists in root directory
2. Verify variable name is exact: `EXPO_PUBLIC_POLYGON_API_KEY`
3. Restart app with cache clear: `npx expo start -c`

### Issue: Search Returns No Results

**Possible Causes**:

1. **API Key Invalid**:
   - Test your key with curl command above
   - Regenerate key from provider dashboard

2. **Rate Limit Exceeded**:
   - Wait 1 minute and try again
   - Check your usage on provider dashboard

3. **Asset Not Found**:
   - For stocks: Use correct ticker symbol (AAPL not Apple)
   - For crypto: Use CoinGecko ID (bitcoin not BTC)

**Solution**:
```env
# Enable fallback to mock data
EXPO_PUBLIC_USE_REAL_API=true
```

The app will automatically use mock data if API fails.

### Issue: Prices Not Updating

**Check**:
1. Is `EXPO_PUBLIC_USE_REAL_API=true`?
2. Is API key valid?
3. Check console for errors
4. Check rate limits

**Debug**:
- Open React Native Debugger
- Check console logs
- Look for API error messages

### Issue: Environment Variables Not Loading

**Solution**:
1. Install `expo-constants`:
   ```bash
   npm install expo-constants
   ```

2. Clear cache:
   ```bash
   npx expo start -c
   ```

3. Verify `.env` file location (must be in root)

4. Check variable names start with `EXPO_PUBLIC_`

---

## Alternative APIs

If you want to use different providers:

### Alpha Vantage

- **Website**: https://www.alphavantage.co/
- **Free Tier**: 500 calls/day, 5 calls/minute
- **Best for**: US stocks, forex
- **API Key**: Free signup

**Implementation**: Create `src/services/api/alphaVantageApi.ts` following the pattern of `polygonApi.ts`

### Finnhub

- **Website**: https://finnhub.io/
- **Free Tier**: 60 calls/minute
- **Best for**: Stock market data, news
- **API Key**: Free signup

### Yahoo Finance (Unofficial)

- **Library**: `yahoo-finance2`
- **Free Tier**: Unlimited (use responsibly)
- **Best for**: Stock data
- **Note**: Unofficial, terms may change

**Installation**:
```bash
npm install yahoo-finance2
```

### Binance API (For Crypto)

- **Website**: https://www.binance.com/en/binance-api
- **Free Tier**: High limits
- **Best for**: Cryptocurrency trading data
- **API Key**: Free signup

---

## How the Code Works

### API Integration Flow

```
1. User searches for asset
   ↓
2. App checks if EXPO_PUBLIC_USE_REAL_API=true
   ↓
3. If true:
   - Try CoinGecko (for crypto)
   - Try Polygon.io (for stocks)
   - Fallback to mock data if fails
   ↓
4. If false:
   - Use mock data
```

### File Structure

```
src/services/
├── marketData.ts           # Main service (unified interface)
├── api/
│   ├── polygonApi.ts      # Polygon.io integration
│   └── coinGeckoApi.ts    # CoinGecko integration
```

### Adding Your Own API

1. Create new file: `src/services/api/yourApiName.ts`

2. Implement these functions:
   - `searchAssets()`
   - `getAssetDetails()`
   - `getCurrentPrice()`
   - `getCurrentPrices()`
   - `getChartData()`

3. Import in `marketData.ts`:
   ```typescript
   import { searchAssets as searchYourApi } from './api/yourApiName';
   ```

4. Add to search logic:
   ```typescript
   if (USE_REAL_API) {
     const result = await searchYourApi(query);
     if (result.success) return result;
   }
   ```

---

## Security Best Practices

### ✅ DO:

- Store API keys in `.env` file
- Add `.env` to `.gitignore`
- Use environment-specific keys (dev vs production)
- Rotate keys regularly
- Monitor usage on provider dashboards

### ❌ DON'T:

- Commit API keys to Git
- Share keys publicly
- Use production keys in development
- Hardcode keys in source files
- Expose keys in client-side code (they're in React Native anyway, but minimize exposure)

### .gitignore Example

```gitignore
# Environment files
.env
.env.local
.env.development
.env.production

# API keys
*.key
secrets/
```

---

## Testing Your Integration

### Test Script

Create a test file to verify your setup:

```typescript
// test-api.ts
import { searchAssets, getAssetDetails } from './src/services/marketData';

async function test() {
  // Test stock search
  console.log('Testing stock search...');
  const stockResult = await searchAssets('AAPL');
  console.log('Stock results:', stockResult);

  // Test crypto search
  console.log('\nTesting crypto search...');
  const cryptoResult = await searchAssets('bitcoin');
  console.log('Crypto results:', cryptoResult);

  // Test asset details
  console.log('\nTesting asset details...');
  const details = await getAssetDetails('AAPL');
  console.log('Asset details:', details);
}

test();
```

Run with:
```bash
npx ts-node test-api.ts
```

---

## Support & Resources

### Polygon.io Resources

- Documentation: https://polygon.io/docs/stocks/getting-started
- Support: support@polygon.io
- Community: https://polygon.io/community

### CoinGecko Resources

- Documentation: https://www.coingecko.com/en/api/documentation
- Support: https://www.coingecko.com/en/api#contact
- Status: https://status.coingecko.com/

### MockTrading App Support

- Check console logs for errors
- Verify `.env` configuration
- Test API keys with curl commands
- Check rate limits on provider dashboards

---

## Frequently Asked Questions

### Q: Do I need API keys to use the app?

**A**: No! The app works with mock data by default. API keys are only needed for real market data.

### Q: Which API should I use?

**A**:
- For **stocks**: Use Polygon.io (requires API key)
- For **crypto**: Use CoinGecko (works without API key!)
- For **both**: Use both together (recommended)

### Q: How much does it cost?

**A**:
- **Free option**: CoinGecko for crypto (no API key needed)
- **Polygon.io**: Free tier (5 calls/min) or $29/month for unlimited
- **Total cost**: Can be $0 (crypto only) or $29/month (stocks + crypto)

### Q: Can I use the app offline?

**A**: The app needs internet to fetch prices. But you can use mock data mode which works offline:
```env
EXPO_PUBLIC_USE_REAL_API=false
```

### Q: How do I know if API is working?

**A**: Check the app console for logs:
- "Real API search failed, falling back to mock data" = API not working
- No error messages + search returns many results = API working!

### Q: Can I switch between APIs easily?

**A**: Yes! Just change the `.env` variable:
```env
# Use real API
EXPO_PUBLIC_USE_REAL_API=true

# Use mock data
EXPO_PUBLIC_USE_REAL_API=false
```

---

## Next Steps

1. ✅ Get your API keys from Polygon.io and/or CoinGecko
2. ✅ Create `.env` file with your keys
3. ✅ Restart the app
4. ✅ Search for real stocks and crypto!
5. ✅ Monitor your API usage
6. ✅ Upgrade plans if needed

---

## Summary

You now have:

- ✅ Real-time stock prices (Polygon.io)
- ✅ Real-time crypto prices (CoinGecko)
- ✅ Live price updates every 5 seconds
- ✅ Ability to search ANY stock or crypto
- ✅ Historical chart data
- ✅ Automatic fallback to mock data

**Happy trading!** 🚀📈
