import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Wallet,
  PortfolioHolding,
  Transaction,
  FavouriteAsset,
  PortfolioSummary,
  AssetCategory,
} from '../types';
import {
  getWallet,
  addFundsToWallet,
  getPortfolio,
  getTransactions,
  getFavourites,
  addToPortfolio,
  removeFromPortfolio,
  createTransaction,
  addToFavourites,
  removeFromFavourites,
  isFavourite,
  deductFundsFromWallet,
} from '../database/services';
import { calculatePortfolioSummary, updateHoldingWithPrice } from '../utils';
import { getCurrentPrices } from '../services/marketData';
import { TransactionType } from '../types';

interface AppContextType {
  // Wallet
  wallet: Wallet | null;
  refreshWallet: () => Promise<void>;
  addFunds: (amount: number) => Promise<void>;

  // Portfolio
  portfolio: PortfolioHolding[];
  portfolioSummary: PortfolioSummary;
  refreshPortfolio: () => Promise<void>;

  // Transactions
  transactions: Transaction[];
  recentTransactions: Transaction[];
  refreshTransactions: () => Promise<void>;

  // Favourites
  favourites: FavouriteAsset[];
  refreshFavourites: () => Promise<void>;
  addFavourite: (data: {
    assetId: string;
    symbol: string;
    name: string;
    category: AssetCategory;
  }) => Promise<void>;
  removeFavourite: (assetId: string) => Promise<void>;
  checkIsFavourite: (assetId: string) => Promise<boolean>;

  // Buy/Sell
  executeBuy: (data: {
    assetId: string;
    assetSymbol: string;
    assetName: string;
    category: AssetCategory;
    entryPrice: number;
    quantity: number;
    amount: number;
  }) => Promise<void>;
  executeSell: (data: {
    assetId: string;
    assetSymbol: string;
    assetName: string;
    category: AssetCategory;
    exitPrice: number;
    quantity: number;
    amount: number;
  }) => Promise<void>;

  // Loading states
  loading: boolean;
  refreshing: boolean;

  // Refresh all data
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    totalInvested: 0,
    currentValue: 0,
    profitLoss: 0,
    profitLossPercent: 0,
    totalHoldings: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [favourites, setFavourites] = useState<FavouriteAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh wallet
  const refreshWallet = async () => {
    const walletData = await getWallet();
    setWallet(walletData);
  };

  // Add funds to wallet
  const addFunds = async (amount: number) => {
    await addFundsToWallet(amount);
    await refreshWallet();
  };

  // Refresh portfolio with live prices
  const refreshPortfolio = async () => {
    const holdings = await getPortfolio();

    // Get live prices for all assets
    const assetIds = holdings.map((h) => h.assetId);
    if (assetIds.length > 0) {
      const pricesResponse = await getCurrentPrices(assetIds);
      if (pricesResponse.success && pricesResponse.data) {
        const updatedHoldings = holdings.map((holding) => {
          const currentPrice = pricesResponse.data![holding.assetId] || holding.currentPrice;
          return updateHoldingWithPrice(holding, currentPrice);
        });
        setPortfolio(updatedHoldings);
        setPortfolioSummary(calculatePortfolioSummary(updatedHoldings));
        return;
      }
    }

    setPortfolio(holdings);
    setPortfolioSummary(calculatePortfolioSummary(holdings));
  };

  // Refresh transactions
  const refreshTransactions = async () => {
    const allTransactions = await getTransactions();
    setTransactions(allTransactions);
    setRecentTransactions(allTransactions.slice(0, 10));
  };

  // Refresh favourites
  const refreshFavourites = async () => {
    const favs = await getFavourites();
    setFavourites(favs);
  };

  // Add to favourites
  const addFavourite = async (data: {
    assetId: string;
    symbol: string;
    name: string;
    category: AssetCategory;
  }) => {
    await addToFavourites(data);
    await refreshFavourites();
  };

  // Remove from favourites
  const removeFavourite = async (assetId: string) => {
    await removeFromFavourites(assetId);
    await refreshFavourites();
  };

  // Check if asset is favourite
  const checkIsFavourite = async (assetId: string): Promise<boolean> => {
    return await isFavourite(assetId);
  };

  // Execute buy transaction
  const executeBuy = async (data: {
    assetId: string;
    assetSymbol: string;
    assetName: string;
    category: AssetCategory;
    entryPrice: number;
    quantity: number;
    amount: number;
  }) => {
    // Deduct from wallet
    await deductFundsFromWallet(data.amount, `Buy ${data.assetSymbol}`);

    // Add to portfolio
    await addToPortfolio({
      assetId: data.assetId,
      assetSymbol: data.assetSymbol,
      assetName: data.assetName,
      category: data.category,
      quantity: data.quantity,
      price: data.entryPrice,
      amount: data.amount,
    });

    // Create transaction record
    await createTransaction({
      assetId: data.assetId,
      assetSymbol: data.assetSymbol,
      assetName: data.assetName,
      category: data.category,
      type: TransactionType.BUY,
      price: data.entryPrice,
      quantity: data.quantity,
      amount: data.amount,
    });

    // Refresh all related data
    await Promise.all([refreshWallet(), refreshPortfolio(), refreshTransactions()]);
  };

  // Execute sell transaction
  const executeSell = async (data: {
    assetId: string;
    assetSymbol: string;
    assetName: string;
    category: AssetCategory;
    exitPrice: number;
    quantity: number;
    amount: number;
  }) => {
    // Remove from portfolio
    await removeFromPortfolio(data.assetId, data.quantity, data.exitPrice);

    // Add to wallet
    await addFundsToWallet(data.amount);

    // Create transaction record
    await createTransaction({
      assetId: data.assetId,
      assetSymbol: data.assetSymbol,
      assetName: data.assetName,
      category: data.category,
      type: TransactionType.SELL,
      price: data.exitPrice,
      quantity: data.quantity,
      amount: data.amount,
    });

    // Refresh all related data
    await Promise.all([refreshWallet(), refreshPortfolio(), refreshTransactions()]);
  };

  // Refresh all data
  const refreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshWallet(),
        refreshPortfolio(),
        refreshTransactions(),
        refreshFavourites(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await refreshAll();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const value: AppContextType = {
    wallet,
    refreshWallet,
    addFunds,
    portfolio,
    portfolioSummary,
    refreshPortfolio,
    transactions,
    recentTransactions,
    refreshTransactions,
    favourites,
    refreshFavourites,
    addFavourite,
    removeFavourite,
    checkIsFavourite,
    executeBuy,
    executeSell,
    loading,
    refreshing,
    refreshAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
