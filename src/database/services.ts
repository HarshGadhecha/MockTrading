import { executeQuery, executeStatement, executeTransaction } from './index';
import {
  Wallet,
  WalletTransaction,
  Transaction,
  PortfolioHolding,
  FavouriteAsset,
  WalletRow,
  WalletTransactionRow,
  TransactionRow,
  PortfolioRow,
  FavouriteRow,
  TransactionType,
  AssetCategory,
} from '../types';

// ==================== WALLET SERVICES ====================

export async function getWallet(): Promise<Wallet | null> {
  const rows = await executeQuery<WalletRow>(
    'SELECT * FROM wallet WHERE id = 1 LIMIT 1'
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    totalFundsAdded: row.total_funds_added,
    totalFundsUsed: row.total_funds_used,
    currentBalance: row.current_balance,
    lastUpdated: new Date(row.last_updated),
  };
}

export async function addFundsToWallet(amount: number): Promise<void> {
  const wallet = await getWallet();
  if (!wallet) throw new Error('Wallet not found');

  const newBalance = wallet.currentBalance + amount;
  const newTotalAdded = wallet.totalFundsAdded + amount;

  await executeTransaction([
    {
      sql: `UPDATE wallet SET
            total_funds_added = ?,
            current_balance = ?,
            last_updated = datetime('now')
            WHERE id = 1`,
      params: [newTotalAdded, newBalance],
    },
    {
      sql: `INSERT INTO wallet_transactions (type, amount, description, timestamp, balance_after)
            VALUES (?, ?, ?, datetime('now'), ?)`,
      params: ['add', amount, 'Virtual funds added', newBalance],
    },
  ]);
}

export async function deductFundsFromWallet(
  amount: number,
  description: string
): Promise<void> {
  const wallet = await getWallet();
  if (!wallet) throw new Error('Wallet not found');
  if (wallet.currentBalance < amount) {
    throw new Error('Insufficient funds');
  }

  const newBalance = wallet.currentBalance - amount;
  const newTotalUsed = wallet.totalFundsUsed + amount;

  await executeTransaction([
    {
      sql: `UPDATE wallet SET
            total_funds_used = ?,
            current_balance = ?,
            last_updated = datetime('now')
            WHERE id = 1`,
      params: [newTotalUsed, newBalance],
    },
    {
      sql: `INSERT INTO wallet_transactions (type, amount, description, timestamp, balance_after)
            VALUES (?, ?, ?, datetime('now'), ?)`,
      params: ['deduct', amount, description, newBalance],
    },
  ]);
}

export async function getWalletTransactions(
  limit?: number
): Promise<WalletTransaction[]> {
  const sql = limit
    ? 'SELECT * FROM wallet_transactions ORDER BY timestamp DESC LIMIT ?'
    : 'SELECT * FROM wallet_transactions ORDER BY timestamp DESC';
  const params = limit ? [limit] : [];

  const rows = await executeQuery<WalletTransactionRow>(sql, params);

  return rows.map((row) => ({
    id: row.id,
    type: row.type as 'add' | 'deduct',
    amount: row.amount,
    description: row.description,
    timestamp: new Date(row.timestamp),
    balanceAfter: row.balance_after,
  }));
}

// ==================== TRANSACTION SERVICES ====================

export async function createTransaction(data: {
  assetId: string;
  assetSymbol: string;
  assetName: string;
  category: AssetCategory;
  type: TransactionType;
  price: number;
  quantity: number;
  amount: number;
  notes?: string;
}): Promise<number> {
  const result = await executeStatement(
    `INSERT INTO transactions (asset_id, asset_symbol, asset_name, category, type, price, quantity, amount, timestamp, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
    [
      data.assetId,
      data.assetSymbol,
      data.assetName,
      data.category,
      data.type,
      data.price,
      data.quantity,
      data.amount,
      data.notes || null,
    ]
  );

  return result.lastInsertRowId;
}

export async function getTransactions(limit?: number): Promise<Transaction[]> {
  const sql = limit
    ? 'SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ?'
    : 'SELECT * FROM transactions ORDER BY timestamp DESC';
  const params = limit ? [limit] : [];

  const rows = await executeQuery<TransactionRow>(sql, params);

  return rows.map((row) => ({
    id: row.id,
    assetId: row.asset_id,
    assetSymbol: row.asset_symbol,
    assetName: row.asset_name,
    category: row.category as AssetCategory,
    type: row.type as TransactionType,
    price: row.price,
    quantity: row.quantity,
    amount: row.amount,
    timestamp: new Date(row.timestamp),
    notes: row.notes || undefined,
  }));
}

export async function getTransactionsByAsset(
  assetId: string
): Promise<Transaction[]> {
  const rows = await executeQuery<TransactionRow>(
    'SELECT * FROM transactions WHERE asset_id = ? ORDER BY timestamp DESC',
    [assetId]
  );

  return rows.map((row) => ({
    id: row.id,
    assetId: row.asset_id,
    assetSymbol: row.asset_symbol,
    assetName: row.asset_name,
    category: row.category as AssetCategory,
    type: row.type as TransactionType,
    price: row.price,
    quantity: row.quantity,
    amount: row.amount,
    timestamp: new Date(row.timestamp),
    notes: row.notes || undefined,
  }));
}

// ==================== PORTFOLIO SERVICES ====================

export async function getPortfolio(): Promise<PortfolioHolding[]> {
  const rows = await executeQuery<PortfolioRow>(
    'SELECT * FROM portfolio WHERE total_quantity > 0 ORDER BY total_invested DESC'
  );

  return rows.map((row) => ({
    id: row.id,
    assetId: row.asset_id,
    assetSymbol: row.asset_symbol,
    assetName: row.asset_name,
    category: row.category as AssetCategory,
    totalQuantity: row.total_quantity,
    averageEntryPrice: row.average_entry_price,
    totalInvested: row.total_invested,
    currentPrice: 0, // Will be updated with live price
    currentValue: 0,
    profitLoss: 0,
    profitLossPercent: 0,
    firstPurchaseDate: new Date(row.first_purchase_date),
    lastUpdated: new Date(row.last_updated),
  }));
}

export async function getPortfolioByCategory(
  category: AssetCategory
): Promise<PortfolioHolding[]> {
  const rows = await executeQuery<PortfolioRow>(
    'SELECT * FROM portfolio WHERE category = ? AND total_quantity > 0 ORDER BY total_invested DESC',
    [category]
  );

  return rows.map((row) => ({
    id: row.id,
    assetId: row.asset_id,
    assetSymbol: row.asset_symbol,
    assetName: row.asset_name,
    category: row.category as AssetCategory,
    totalQuantity: row.total_quantity,
    averageEntryPrice: row.average_entry_price,
    totalInvested: row.total_invested,
    currentPrice: 0,
    currentValue: 0,
    profitLoss: 0,
    profitLossPercent: 0,
    firstPurchaseDate: new Date(row.first_purchase_date),
    lastUpdated: new Date(row.last_updated),
  }));
}

export async function addToPortfolio(data: {
  assetId: string;
  assetSymbol: string;
  assetName: string;
  category: AssetCategory;
  quantity: number;
  price: number;
  amount: number;
}): Promise<void> {
  const existing = await executeQuery<PortfolioRow>(
    'SELECT * FROM portfolio WHERE asset_id = ?',
    [data.assetId]
  );

  if (existing.length === 0) {
    // New holding
    await executeStatement(
      `INSERT INTO portfolio (asset_id, asset_symbol, asset_name, category, total_quantity, average_entry_price, total_invested, first_purchase_date, last_updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        data.assetId,
        data.assetSymbol,
        data.assetName,
        data.category,
        data.quantity,
        data.price,
        data.amount,
      ]
    );
  } else {
    // Update existing holding
    const current = existing[0];
    const newQuantity = current.total_quantity + data.quantity;
    const newInvested = current.total_invested + data.amount;
    const newAvgPrice = newInvested / newQuantity;

    await executeStatement(
      `UPDATE portfolio SET
       total_quantity = ?,
       average_entry_price = ?,
       total_invested = ?,
       last_updated = datetime('now')
       WHERE asset_id = ?`,
      [newQuantity, newAvgPrice, newInvested, data.assetId]
    );
  }
}

export async function removeFromPortfolio(
  assetId: string,
  quantity: number,
  exitPrice: number
): Promise<void> {
  const existing = await executeQuery<PortfolioRow>(
    'SELECT * FROM portfolio WHERE asset_id = ?',
    [assetId]
  );

  if (existing.length === 0) {
    throw new Error('Asset not found in portfolio');
  }

  const current = existing[0];
  if (current.total_quantity < quantity) {
    throw new Error('Insufficient quantity');
  }

  const newQuantity = current.total_quantity - quantity;
  const proportionSold = quantity / current.total_quantity;
  const investedSold = current.total_invested * proportionSold;
  const newInvested = current.total_invested - investedSold;

  if (newQuantity <= 0) {
    // Remove from portfolio
    await executeStatement('DELETE FROM portfolio WHERE asset_id = ?', [
      assetId,
    ]);
  } else {
    // Update portfolio
    await executeStatement(
      `UPDATE portfolio SET
       total_quantity = ?,
       total_invested = ?,
       last_updated = datetime('now')
       WHERE asset_id = ?`,
      [newQuantity, newInvested, assetId]
    );
  }
}

// ==================== FAVOURITES SERVICES ====================

export async function getFavourites(): Promise<FavouriteAsset[]> {
  const rows = await executeQuery<FavouriteRow>(
    'SELECT * FROM favourites ORDER BY added_at DESC'
  );

  return rows.map((row) => ({
    id: row.id,
    assetId: row.asset_id,
    symbol: row.symbol,
    name: row.name,
    category: row.category as AssetCategory,
    addedAt: new Date(row.added_at),
  }));
}

export async function addToFavourites(data: {
  assetId: string;
  symbol: string;
  name: string;
  category: AssetCategory;
}): Promise<void> {
  await executeStatement(
    `INSERT OR IGNORE INTO favourites (asset_id, symbol, name, category, added_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [data.assetId, data.symbol, data.name, data.category]
  );
}

export async function removeFromFavourites(assetId: string): Promise<void> {
  await executeStatement('DELETE FROM favourites WHERE asset_id = ?', [
    assetId,
  ]);
}

export async function isFavourite(assetId: string): Promise<boolean> {
  const rows = await executeQuery<{ count: number }>(
    'SELECT COUNT(*) as count FROM favourites WHERE asset_id = ?',
    [assetId]
  );
  return rows[0].count > 0;
}
