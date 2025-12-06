import React, { useState } from 'react';
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
import { Card, PriceChange, Loading } from '@/src/components';
import { formatCurrency, formatQuantity } from '@/src/utils';
import { Colors, Typography, Spacing } from '@/src/constants/theme';
import { AssetCategory } from '@/src/types';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: AssetCategory.INDIAN_STOCKS, label: 'Indian Stocks' },
  { key: AssetCategory.US_STOCKS, label: 'US Stocks' },
  { key: AssetCategory.CRYPTO, label: 'Crypto' },
  { key: AssetCategory.COMMODITIES, label: 'Commodities' },
];

export default function PortfolioScreen() {
  const { portfolio, portfolioSummary, loading, refreshing, refreshPortfolio } =
    useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredPortfolio =
    selectedCategory === 'all'
      ? portfolio
      : portfolio.filter((h) => h.category === selectedCategory);

  if (loading) {
    return <Loading text="Loading portfolio..." />;
  }

  return (
    <View style={styles.container}>
      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
        <Text style={styles.summaryValue}>
          {formatCurrency(portfolioSummary.currentValue)}
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Invested</Text>
            <Text style={styles.summaryItemValue}>
              {formatCurrency(portfolioSummary.totalInvested)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>P/L</Text>
            <PriceChange
              value={portfolioSummary.profitLoss}
              percentage={portfolioSummary.profitLossPercent}
              size="small"
              showIcon={false}
            />
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Holdings</Text>
            <Text style={styles.summaryItemValue}>
              {portfolioSummary.totalHoldings}
            </Text>
          </View>
        </View>
      </Card>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.tab,
              selectedCategory === cat.key && styles.tabActive,
            ]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === cat.key && styles.tabTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Holdings List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshPortfolio} />
        }
      >
        {filteredPortfolio.length > 0 ? (
          filteredPortfolio.map((holding) => (
            <TouchableOpacity
              key={holding.id}
              style={styles.holdingCard}
              onPress={() => router.push(`/asset/${holding.assetId}`)}
            >
              <View style={styles.holdingHeader}>
                <View style={styles.holdingInfo}>
                  <Text style={styles.holdingSymbol}>{holding.assetSymbol}</Text>
                  <Text style={styles.holdingName}>{holding.assetName}</Text>
                </View>
                <PriceChange
                  value={holding.profitLoss}
                  percentage={holding.profitLossPercent}
                  size="small"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.holdingStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Quantity</Text>
                  <Text style={styles.statValue}>
                    {formatQuantity(holding.totalQuantity)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Avg Price</Text>
                  <Text style={styles.statValue}>
                    {formatCurrency(holding.averageEntryPrice)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Current Price</Text>
                  <Text style={styles.statValue}>
                    {formatCurrency(holding.currentPrice)}
                  </Text>
                </View>
              </View>

              <View style={styles.holdingFooter}>
                <View style={styles.footerItem}>
                  <Text style={styles.footerLabel}>Invested</Text>
                  <Text style={styles.footerValue}>
                    {formatCurrency(holding.totalInvested)}
                  </Text>
                </View>
                <View style={styles.footerItem}>
                  <Text style={styles.footerLabel}>Current Value</Text>
                  <Text style={styles.footerValue}>
                    {formatCurrency(holding.currentValue)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Holdings</Text>
            <Text style={styles.emptyStateText}>
              {selectedCategory === 'all'
                ? 'Start trading to see your portfolio here.'
                : `No holdings in ${CATEGORIES.find((c) => c.key === selectedCategory)?.label}.`}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  summaryCard: {
    margin: Spacing.md,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {},
  summaryItemLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryItemValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  tabsContainer: {
    marginBottom: Spacing.md,
  },
  tabsContent: {
    paddingHorizontal: Spacing.md,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  tabTextActive: {
    color: Colors.textWhite,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  holdingCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingSymbol: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  holdingName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  holdingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
  },
  holdingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundGray,
    padding: Spacing.sm,
    borderRadius: 8,
  },
  footerItem: {
    flex: 1,
  },
  footerLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
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
  },
});
