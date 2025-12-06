import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/src/context';
import { Card, PriceChange, Loading, AssetItem } from '@/src/components';
import { formatCurrency, formatRelativeTime } from '@/src/utils';
import { Colors, Typography, Spacing } from '@/src/constants/theme';

export default function HomeScreen() {
  const {
    wallet,
    portfolioSummary,
    recentTransactions,
    loading,
    refreshing,
    refreshAll,
    portfolio,
  } = useApp();

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshAll} />
      }
    >
      <View style={styles.content}>
        {/* Portfolio Summary Card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Total Portfolio Value</Text>
          <Text style={styles.portfolioValue}>
            {formatCurrency(portfolioSummary.currentValue)}
          </Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Invested</Text>
              <Text style={styles.value}>
                {formatCurrency(portfolioSummary.totalInvested)}
              </Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>P/L</Text>
              <PriceChange
                value={portfolioSummary.profitLoss}
                percentage={portfolioSummary.profitLossPercent}
                size="medium"
                showIcon={false}
              />
            </View>
          </View>
        </Card>

        {/* Virtual Wallet Card */}
        <Card style={styles.card}>
          <View style={styles.walletHeader}>
            <View>
              <Text style={styles.cardTitle}>Virtual Wallet</Text>
              <Text style={styles.walletBalance}>
                {formatCurrency(wallet?.currentBalance || 0)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/(tabs)/wallet')}
            >
              <Text style={styles.addButtonText}>Add Funds</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Top Holdings */}
        {portfolio.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Holdings</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/portfolio')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {portfolio.slice(0, 3).map((holding) => (
              <TouchableOpacity
                key={holding.id}
                style={styles.holdingItem}
                onPress={() => router.push(`/asset/${holding.assetId}`)}
              >
                <View style={styles.holdingInfo}>
                  <Text style={styles.holdingSymbol}>{holding.assetSymbol}</Text>
                  <Text style={styles.holdingName}>{holding.assetName}</Text>
                </View>
                <View style={styles.holdingStats}>
                  <Text style={styles.holdingValue}>
                    {formatCurrency(holding.currentValue)}
                  </Text>
                  <PriceChange
                    value={holding.profitLoss}
                    percentage={holding.profitLossPercent}
                    size="small"
                    showIcon={false}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        {recentTransactions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentTransactions.slice(0, 5).map((tx) => (
              <View key={tx.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionSymbol}>{tx.assetSymbol}</Text>
                  <Text style={styles.transactionTime}>
                    {formatRelativeTime(tx.timestamp)}
                  </Text>
                </View>
                <View style={styles.transactionStats}>
                  <Text
                    style={[
                      styles.transactionType,
                      tx.type === 'buy' ? styles.buyType : styles.sellType,
                    ]}
                  >
                    {tx.type.toUpperCase()}
                  </Text>
                  <Text style={styles.transactionAmount}>
                    {formatCurrency(tx.amount)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {portfolio.length === 0 && recentTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Start Trading!</Text>
            <Text style={styles.emptyStateText}>
              Search for assets in the Wishlist tab and start your virtual
              trading journey.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  portfolioValue: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletBalance: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.textWhite,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  seeAll: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  holdingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingSymbol: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  holdingName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  holdingStats: {
    alignItems: 'flex-end',
  },
  holdingValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionSymbol: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  transactionTime: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionStats: {
    alignItems: 'flex-end',
  },
  transactionType: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
  },
  buyType: {
    color: Colors.success,
  },
  sellType: {
    color: Colors.error,
  },
  transactionAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyStateTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
