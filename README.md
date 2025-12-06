# Mock Trading Portfolio App

A complete virtual trading and market simulation app built with React Native and Expo. Practice trading with real-time market data without risking real money.

## 🎯 Features

### Core Functionality
- **Virtual Trading**: Simulate buying and selling of stocks, cryptocurrencies, and commodities
- **Real-time Market Data**: Track live prices and market movements
- **Portfolio Management**: Monitor your virtual holdings and performance
- **Transaction History**: Complete record of all your virtual trades
- **Virtual Wallet**: Manage your virtual funds for practice trading
- **Wishlist/Favourites**: Track and monitor your favorite assets

### Supported Asset Categories
- Indian Stocks
- US Stocks
- European Stocks
- Commodities
- Cryptocurrencies

### Smart Trading Features
- **Smart Buy System**: Auto-calculate quantity from investment amount
- **Smart Sell System**: Three exit methods
  - Percentage-based (25%, 50%, 75%, 100%)
  - Amount-based
  - Quantity-based
- **Real-time P/L Calculation**: Track profits and losses instantly
- **Advanced Analytics**: Portfolio summaries and performance metrics

## 📱 App Structure

```
app/
├── (tabs)/                 # Tab navigation screens
│   ├── index.tsx          # Home/Dashboard
│   ├── wishlist.tsx       # Favourites & Search
│   ├── portfolio.tsx      # Portfolio Holdings
│   ├── history.tsx        # Transaction History
│   └── wallet.tsx         # Virtual Wallet
├── asset/
│   └── [id].tsx           # Asset Detail Screen
├── modals/
│   ├── buy.tsx            # Buy Modal
│   └── sell.tsx           # Sell Modal
└── _layout.tsx            # Root Layout

src/
├── components/            # Reusable UI components
├── constants/             # Theme, colors, config
├── context/               # App state management
├── database/              # SQLite database & services
├── services/              # API & external services
├── types/                 # TypeScript definitions
└── utils/                 # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for macOS) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MockTrading
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on your preferred platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

## 🗄️ Database Schema

The app uses SQLite for local data storage with the following tables:

### Wallet
- Stores virtual wallet balance and transaction history
- Tracks total funds added and used

### Transactions
- Records all buy/sell operations
- Includes asset details, prices, quantities, and timestamps

### Portfolio
- Maintains current holdings
- Calculates average entry prices and totals

### Favourites
- Stores user's favourite assets for quick access

### Settings
- App preferences and configuration

## 🔧 Configuration

### Market Data API
The app currently uses mock data. To integrate real market data:

1. Choose a market data provider (Alpha Vantage, Polygon.io, etc.)
2. Update `src/services/marketData.ts`
3. Replace mock functions with actual API calls
4. Add your API key to environment variables

### Google AdMob Integration
To enable ads:

1. Install the AdMob package:
```bash
npm install react-native-google-mobile-ads
```

2. Get your AdMob App ID from [Google AdMob](https://apps.admob.com/)

3. Update `app.json` with your AdMob IDs:
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-xxxxx~xxxxx",
          "iosAppId": "ca-app-pub-xxxxx~xxxxx"
        }
      ]
    ]
  }
}
```

4. Replace test Ad Unit IDs in `src/constants/index.ts`
5. Follow instructions in `src/services/admob.ts`

## 🎨 Customization

### Theme
Edit `src/constants/theme.ts` to customize:
- Colors
- Typography
- Spacing
- Border radius
- Shadows

### Default Settings
Edit `src/constants/index.ts` to modify:
- Default wallet balance ($100,000)
- Price refresh interval
- Currency symbols
- Transaction limits

## 📊 Key Components

### AppContext (`src/context/AppContext.tsx`)
Global state management for:
- Wallet operations
- Portfolio management
- Transaction handling
- Favourites management

### Database Services (`src/database/services.ts`)
CRUD operations for:
- Wallet transactions
- Trading transactions
- Portfolio holdings
- Favourites

### Utility Functions (`src/utils/`)
- `format.ts`: Currency, date, and number formatting
- `calculations.ts`: Trading calculations and validations

## 🧪 Testing

The app includes mock data for testing. To test:

1. Add virtual funds in the Wallet tab
2. Search for assets in the Wishlist tab
3. View asset details and buy/sell
4. Monitor portfolio performance
5. Check transaction history

## 📝 Development Notes

### Important Files

#### Database Initialization
`src/database/index.ts` - Handles database setup and connections

#### Navigation
`app/_layout.tsx` - Root navigation configuration
`app/(tabs)/_layout.tsx` - Tab navigation setup

#### Type Definitions
`src/types/index.ts` - All TypeScript interfaces and types

### Adding New Features

1. **New Asset Category**:
   - Add to `AssetCategory` enum in `src/types/index.ts`
   - Update constants in `src/constants/index.ts`
   - Add filtering logic in Portfolio screen

2. **New Transaction Type**:
   - Add to `TransactionType` enum
   - Update database services
   - Create UI components

3. **New Screen**:
   - Add route in `app/` directory
   - Update navigation in `_layout.tsx`
   - Create screen component

## 🔒 Privacy & Security

- **No User Accounts**: App works without login
- **Local Data Only**: All data stored locally using SQLite
- **No Cloud Sync**: Data never leaves the device
- **No Personal Information**: No collection of user data
- **Virtual Funds Only**: No real money transactions

## ⚠️ Disclaimers

- This is a simulation app for educational purposes only
- No real money is involved in any transactions
- Virtual funds have no real-world value
- Market data may be delayed or simulated
- Not financial advice - for practice only

## 🛠️ Built With

- [React Native](https://reactnative.dev/) - Mobile framework
- [Expo](https://expo.dev/) - Development platform
- [Expo Router](https://expo.github.io/router/) - File-based routing
- [SQLite](https://www.sqlite.org/) - Local database
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [React Native Chart Kit](https://www.npmjs.com/package/react-native-chart-kit) - Charts

## 📱 Screenshots

> Add screenshots of your app here

## 🗺️ Roadmap

- [ ] Real-time market data integration
- [ ] Advanced charting with technical indicators
- [ ] Price alerts and notifications
- [ ] Multiple portfolio support
- [ ] Export transaction history
- [ ] Performance analytics and reports
- [ ] Social features (leaderboards, competitions)
- [ ] Dark mode support
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Mock Trading Portfolio App Team

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- React Native community
- All contributors and testers

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review the code comments

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Complete trading simulation
- Portfolio management
- Transaction history
- Virtual wallet
- Favourites system
- Mock market data

---

**Remember**: This is a virtual trading app for educational purposes. Practice responsible trading strategies!
