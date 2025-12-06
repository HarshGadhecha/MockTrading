import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/src/context';
import { Card, PriceChange, Button, Loading } from '@/src/components';
import { getAssetDetails, getChartData } from '@/src/services/marketData';
import { getTransactionsByAsset, isFavourite } from '@/src/database/services';
import { Asset, Transaction, ChartTimeframe } from '@/src/types';
import { formatCurrency, formatDate, formatQuantity } from '@/src/utils';
import { Colors, Typography, Spacing, DATE_FORMATS } from '@/src/constants';

const TIMEFRAMES: ChartTimeframe[] = [
  ChartTimeframe.ONE_DAY,
  ChartTimeframe.ONE_WEEK,
  ChartTimeframe.ONE_MONTH,
  ChartTimeframe.ONE_YEAR,
  ChartTimeframe.ALL_TIME,
];

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { portfolio, addFavourite, removeFavourite } = useApp();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(ChartTimeframe.ONE_DAY);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);

  const holding = portfolio.find((h) => h.assetId === id);

  useEffect(() => {
    loadAssetData();
    loadTransactions();
    checkFavourite();
  }, [id]);

  const loadAssetData = async () => {
    setLoading(true);
    const response = await getAssetDetails(id);
    if (response.success && response.data) {
      setAsset(response.data);
    }
    setLoading(false);
  };

  const loadTransactions = async () => {
    const txs = await getTransactionsByAsset(id);
    setTransactions(txs);
  };

  const checkFavourite = async () => {
    const fav = await isFavourite(id);
    setIsFav(fav);
  };

  const handleToggleFavourite = async () => {
    if (!asset) return;

    try {
      if (isFav) {
        await removeFavourite(id);
        setIsFav(false);
        Alert.alert('Removed', 'Asset removed from favourites');
      } else {
        await addFavourite({
          assetId: asset.id,
          symbol: asset.symbol,
          name: asset.name,
          category: asset.category,
        });
        setIsFav(true);
        Alert.alert('Added', 'Asset added to favourites');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favourites');
    }
  };

  const handleBuy = () => {
    if (!asset) return;
    router.push({
      pathname: '/modals/buy',
      params: {
        assetId: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        category: asset.category,
        currentPrice: asset.currentPrice.toString(),
      },
    });
  };

  const handleSell = () => {
    if (!asset || !holding) return;
    router.push({
      pathname: '/modals/sell',
      params: {
        assetId: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        category: asset.category,
        currentPrice: asset.currentPrice.toString(),
        availableQuantity: holding.totalQuantity.toString(),
        averagePrice: holding.averageEntryPrice.toString(),
      },
    });
  };

  if (loading) {
    return <Loading text="Loading asset details..." />;
  }

  if (!asset) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Asset not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: asset.symbol,
          headerRight: () => (
            <TouchableOpacity onPress={handleToggleFavourite}>
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={24}
                color={isFav ? Colors.error : Colors.textWhite}
                style={{ marginRight: 16 }}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          {/* Price Section */}
          <Card style={styles.priceCard}>
            <Text style={styles.assetName}>{asset.name}</Text>
            <Text style={styles.currentPrice}>
              {formatCurrency(asset.currentPrice)}
            </Text>
            {asset.priceChange !== undefined &&
              asset.priceChangePercent !== undefined && (
                <PriceChange
                  value={asset.priceChange}
                  percentage={asset.priceChangePercent}
                  size="medium"
                />
              )}
          </Card>

          {/* Stats Card */}
          <Card style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Previous Close</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(asset.previousClose || 0)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Day High</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(asset.dayHigh || 0)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Day Low</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(asset.dayLow || 0)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Chart Placeholder */}
          <Card style={styles.chartCard}>
            <Text style={styles.cardTitle}>Price Chart</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.timeframeContainer}
            >
              {TIMEFRAMES.map((tf) => (
                <TouchableOpacity
                  key={tf}
                  style={[
                    styles.timeframeButton,
                    selectedTimeframe === tf && styles.timeframeButtonActive,
                  ]}
                  onPress={() => setSelectedTimeframe(tf)}
                >
                  <Text
                    style={[
                      styles.timeframeText,
                      selectedTimeframe === tf && styles.timeframeTextActive,
                    ]}
                  >
                    {tf}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.chartPlaceholder}>
              <Ionicons
                name="trending-up"
                size={48}
                color={Colors.textLight}
              />
              <Text style={styles.chartPlaceholderText}>
                Chart visualization
              </Text>
              <Text style={styles.chartPlaceholderSubtext}>
                Timeframe: {selectedTimeframe}
              </Text>
            </View>
          </Card>

          {/* Your Holding (if any) */}
          {holding && (
            <Card style={styles.holdingCard}>
              <Text style={styles.cardTitle}>Your Holding</Text>
              <View style={styles.holdingStats}>
                <View style={styles.holdingStat}>
                  <Text style={styles.holdingLabel}>Quantity</Text>
                  <Text style={styles.holdingValue}>
                    {formatQuantity(holding.totalQuantity)}
                  </Text>
                </View>
                <View style={styles.holdingStat}>
                  <Text style={styles.holdingLabel}>Avg Price</Text>
                  <Text style={styles.holdingValue}>
                    {formatCurrency(holding.averageEntryPrice)}
                  </Text>
                </View>
                <View style={styles.holdingStat}>
                  <Text style={styles.holdingLabel}>Invested</Text>
                  <Text style={styles.holdingValue}>
                    {formatCurrency(holding.totalInvested)}
                  </Text>
                </View>
              </View>
              <View style={styles.holdingPL}>
                <Text style={styles.holdingLabel}>Profit/Loss</Text>
                <PriceChange
                  value={holding.profitLoss}
                  percentage={holding.profitLossPercent}
                  size="medium"
                />
              </View>
            </Card>
          )}

          {/* Transaction History */}
          {transactions.length > 0 && (
            <Card style={styles.transactionsCard}>
              <Text style={styles.cardTitle}>Your Transactions</Text>
              {transactions.map((tx) => (
                <View key={tx.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text
                      style={[
                        styles.transactionType,
                        tx.type === 'buy'
                          ? styles.buyType
                          : styles.sellType,
                      ]}
                    >
                      {tx.type.toUpperCase()}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(tx.timestamp, DATE_FORMATS.DATE_ONLY)}
                    </Text>
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionAmount}>
                      {formatQuantity(tx.quantity)} @ {formatCurrency(tx.price)}
                    </Text>
                    <Text style={styles.transactionTotal}>
                      {formatCurrency(tx.amount)}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="BUY"
            onPress={handleBuy}
            variant="success"
            style={styles.buyButton}
          />
          <Button
            title="SELL"
            onPress={handleSell}
            variant="error"
            style={styles.sellButton}
            disabled={!holding || holding.totalQuantity <= 0}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  priceCard: {
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  assetName: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  currentPrice: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  statsCard: {
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  chartCard: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  timeframeContainer: {
    marginBottom: Spacing.md,
  },
  timeframeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
  },
  timeframeButtonActive: {
    backgroundColor: Colors.primary,
  },
  timeframeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  timeframeTextActive: {
    color: Colors.textWhite,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
    borderRadius: 10,
  },
  chartPlaceholderText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  chartPlaceholderSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  holdingCard: {
    marginBottom: Spacing.md,
  },
  holdingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  holdingStat: {
    flex: 1,
  },
  holdingLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  holdingValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  holdingPL: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  transactionsCard: {
    marginBottom: Spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  transactionInfo: {},
  transactionType: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  buyType: {
    color: Colors.success,
  },
  sellType: {
    color: Colors.error,
  },
  transactionDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionDetails: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
  },
  transactionTotal: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  buyButton: {
    flex: 1,
  },
  sellButton: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.error,
  },
});
