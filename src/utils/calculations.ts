import { PortfolioHolding, Transaction, TransactionType } from '../types';

/**
 * Calculate quantity from amount and price
 */
export function calculateQuantity(amount: number, price: number): number {
  if (price <= 0) return 0;
  return amount / price;
}

/**
 * Calculate amount from quantity and price
 */
export function calculateAmount(quantity: number, price: number): number {
  return quantity * price;
}

/**
 * Calculate average entry price
 */
export function calculateAverageEntryPrice(
  currentQuantity: number,
  currentAvgPrice: number,
  newQuantity: number,
  newPrice: number
): number {
  const totalValue =
    currentQuantity * currentAvgPrice + newQuantity * newPrice;
  const totalQuantity = currentQuantity + newQuantity;
  return totalValue / totalQuantity;
}

/**
 * Calculate profit/loss
 */
export function calculateProfitLoss(
  quantity: number,
  entryPrice: number,
  currentPrice: number
): number {
  const invested = quantity * entryPrice;
  const currentValue = quantity * currentPrice;
  return currentValue - invested;
}

/**
 * Calculate profit/loss percentage
 */
export function calculateProfitLossPercent(
  quantity: number,
  entryPrice: number,
  currentPrice: number
): number {
  const invested = quantity * entryPrice;
  if (invested === 0) return 0;
  const profitLoss = calculateProfitLoss(quantity, entryPrice, currentPrice);
  return (profitLoss / invested) * 100;
}

/**
 * Calculate current value
 */
export function calculateCurrentValue(
  quantity: number,
  currentPrice: number
): number {
  return quantity * currentPrice;
}

/**
 * Calculate percentage-based exit quantity
 */
export function calculateExitQuantityByPercentage(
  totalQuantity: number,
  percentage: number
): number {
  return (totalQuantity * percentage) / 100;
}

/**
 * Calculate quantity from exit amount
 */
export function calculateExitQuantityByAmount(
  exitAmount: number,
  currentPrice: number
): number {
  if (currentPrice <= 0) return 0;
  return exitAmount / currentPrice;
}

/**
 * Update portfolio holding with current price
 */
export function updateHoldingWithPrice(
  holding: PortfolioHolding,
  currentPrice: number
): PortfolioHolding {
  const currentValue = calculateCurrentValue(holding.totalQuantity, currentPrice);
  const profitLoss = currentValue - holding.totalInvested;
  const profitLossPercent = holding.totalInvested > 0
    ? (profitLoss / holding.totalInvested) * 100
    : 0;

  return {
    ...holding,
    currentPrice,
    currentValue,
    profitLoss,
    profitLossPercent,
  };
}

/**
 * Calculate portfolio summary
 */
export function calculatePortfolioSummary(holdings: PortfolioHolding[]) {
  const totalInvested = holdings.reduce(
    (sum, h) => sum + h.totalInvested,
    0
  );
  const currentValue = holdings.reduce(
    (sum, h) => sum + h.currentValue,
    0
  );
  const profitLoss = currentValue - totalInvested;
  const profitLossPercent = totalInvested > 0
    ? (profitLoss / totalInvested) * 100
    : 0;

  return {
    totalInvested,
    currentValue,
    profitLoss,
    profitLossPercent,
    totalHoldings: holdings.length,
  };
}

/**
 * Validate buy transaction
 */
export function validateBuyTransaction(
  entryPrice: number,
  investmentAmount: number,
  walletBalance: number
): { valid: boolean; error?: string } {
  if (entryPrice <= 0) {
    return { valid: false, error: 'Entry price must be greater than 0' };
  }

  if (investmentAmount <= 0) {
    return { valid: false, error: 'Investment amount must be greater than 0' };
  }

  if (investmentAmount > walletBalance) {
    return { valid: false, error: 'Insufficient funds in wallet' };
  }

  return { valid: true };
}

/**
 * Validate sell transaction
 */
export function validateSellTransaction(
  exitPrice: number,
  exitQuantity: number,
  availableQuantity: number
): { valid: boolean; error?: string } {
  if (exitPrice <= 0) {
    return { valid: false, error: 'Exit price must be greater than 0' };
  }

  if (exitQuantity <= 0) {
    return { valid: false, error: 'Exit quantity must be greater than 0' };
  }

  if (exitQuantity > availableQuantity) {
    return { valid: false, error: 'Insufficient quantity to sell' };
  }

  return { valid: true };
}

/**
 * Calculate realized profit/loss for a sell transaction
 */
export function calculateRealizedProfitLoss(
  quantity: number,
  entryPrice: number,
  exitPrice: number
): number {
  const invested = quantity * entryPrice;
  const exitValue = quantity * exitPrice;
  return exitValue - invested;
}

/**
 * Calculate total profit/loss from transaction history
 */
export function calculateTotalRealizedPL(transactions: Transaction[]): number {
  let totalPL = 0;
  const holdings: Map<string, { quantity: number; avgPrice: number }> = new Map();

  // Process transactions in chronological order
  const sortedTransactions = [...transactions].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  for (const tx of sortedTransactions) {
    const key = tx.assetId;

    if (tx.type === TransactionType.BUY) {
      const existing = holdings.get(key) || { quantity: 0, avgPrice: 0 };
      const newAvgPrice = calculateAverageEntryPrice(
        existing.quantity,
        existing.avgPrice,
        tx.quantity,
        tx.price
      );
      holdings.set(key, {
        quantity: existing.quantity + tx.quantity,
        avgPrice: newAvgPrice,
      });
    } else if (tx.type === TransactionType.SELL) {
      const existing = holdings.get(key);
      if (existing) {
        const pl = calculateRealizedProfitLoss(
          tx.quantity,
          existing.avgPrice,
          tx.price
        );
        totalPL += pl;

        const newQuantity = existing.quantity - tx.quantity;
        if (newQuantity > 0) {
          holdings.set(key, {
            quantity: newQuantity,
            avgPrice: existing.avgPrice,
          });
        } else {
          holdings.delete(key);
        }
      }
    }
  }

  return totalPL;
}
