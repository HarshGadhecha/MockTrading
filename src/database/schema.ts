// Database Schema Definitions

export const CREATE_TABLES = {
  // Wallet Table
  WALLET: `
    CREATE TABLE IF NOT EXISTS wallet (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_funds_added REAL NOT NULL DEFAULT 0,
      total_funds_used REAL NOT NULL DEFAULT 0,
      current_balance REAL NOT NULL DEFAULT 0,
      last_updated TEXT NOT NULL
    );
  `,

  // Wallet Transactions Table
  WALLET_TRANSACTIONS: `
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('add', 'deduct')),
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      balance_after REAL NOT NULL
    );
  `,

  // Transactions Table (Buy/Sell History)
  TRANSACTIONS: `
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id TEXT NOT NULL,
      asset_symbol TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('buy', 'sell')),
      price REAL NOT NULL,
      quantity REAL NOT NULL,
      amount REAL NOT NULL,
      timestamp TEXT NOT NULL,
      notes TEXT
    );
  `,

  // Portfolio Table (Current Holdings)
  PORTFOLIO: `
    CREATE TABLE IF NOT EXISTS portfolio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id TEXT NOT NULL UNIQUE,
      asset_symbol TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      category TEXT NOT NULL,
      total_quantity REAL NOT NULL DEFAULT 0,
      average_entry_price REAL NOT NULL DEFAULT 0,
      total_invested REAL NOT NULL DEFAULT 0,
      first_purchase_date TEXT NOT NULL,
      last_updated TEXT NOT NULL
    );
  `,

  // Favourites/Wishlist Table
  FAVOURITES: `
    CREATE TABLE IF NOT EXISTS favourites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id TEXT NOT NULL UNIQUE,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      added_at TEXT NOT NULL
    );
  `,

  // Settings Table (for app preferences)
  SETTINGS: `
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `,
};

// Create Indexes for Performance
export const CREATE_INDEXES = {
  TRANSACTIONS_ASSET_ID: `
    CREATE INDEX IF NOT EXISTS idx_transactions_asset_id
    ON transactions(asset_id);
  `,

  TRANSACTIONS_TIMESTAMP: `
    CREATE INDEX IF NOT EXISTS idx_transactions_timestamp
    ON transactions(timestamp DESC);
  `,

  PORTFOLIO_ASSET_ID: `
    CREATE INDEX IF NOT EXISTS idx_portfolio_asset_id
    ON portfolio(asset_id);
  `,

  PORTFOLIO_CATEGORY: `
    CREATE INDEX IF NOT EXISTS idx_portfolio_category
    ON portfolio(category);
  `,

  FAVOURITES_ASSET_ID: `
    CREATE INDEX IF NOT EXISTS idx_favourites_asset_id
    ON favourites(asset_id);
  `,

  WALLET_TRANSACTIONS_TIMESTAMP: `
    CREATE INDEX IF NOT EXISTS idx_wallet_transactions_timestamp
    ON wallet_transactions(timestamp DESC);
  `,
};

// Initial Data
export const INITIAL_DATA = {
  WALLET: `
    INSERT OR IGNORE INTO wallet (id, total_funds_added, total_funds_used, current_balance, last_updated)
    VALUES (1, 100000, 0, 100000, datetime('now'));
  `,

  WALLET_TRANSACTION: `
    INSERT INTO wallet_transactions (type, amount, description, timestamp, balance_after)
    VALUES ('add', 100000, 'Initial virtual funds', datetime('now'), 100000);
  `,

  SETTINGS_DEFAULT_CURRENCY: `
    INSERT OR IGNORE INTO settings (key, value, updated_at)
    VALUES ('default_currency', 'USD', datetime('now'));
  `,

  SETTINGS_REWARDED_ADS_COUNT: `
    INSERT OR IGNORE INTO settings (key, value, updated_at)
    VALUES ('rewarded_ads_today', '0', datetime('now'));
  `,

  SETTINGS_LAST_RESET_DATE: `
    INSERT OR IGNORE INTO settings (key, value, updated_at)
    VALUES ('last_reset_date', datetime('now', 'start of day'), datetime('now'));
  `,
};

// Drop Tables (for development/reset purposes)
export const DROP_TABLES = [
  'DROP TABLE IF EXISTS wallet;',
  'DROP TABLE IF EXISTS wallet_transactions;',
  'DROP TABLE IF EXISTS transactions;',
  'DROP TABLE IF EXISTS portfolio;',
  'DROP TABLE IF EXISTS favourites;',
  'DROP TABLE IF EXISTS settings;',
];
