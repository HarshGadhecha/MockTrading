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
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/src/context';
import { Loading } from '@/src/components';
import { formatCurrency, formatDate, formatQuantity } from '@/src/utils';
import { Colors, Typography, Spacing, DATE_FORMATS } from '@/src/constants';
import { TransactionType } from '@/src/types';

export default function HistoryScreen() {
  const { transactions, loading, refreshing, refreshTransactions } = useApp();
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');

  const filteredTransactions =
    filter === 'all'
      ? transactions
      : transactions.filter((tx) => tx.type === filter);

  if (loading) {
    return <Loading text="Loading history..." />;
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'buy' && styles.filterTabActive]}
          onPress={() => setFilter('buy')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'buy' && styles.filterTextActive,
            ]}
          >
            Buy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'sell' && styles.filterTabActive]}
          onPress={() => setFilter('sell')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'sell' && styles.filterTextActive,
            ]}
          >
            Sell
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshTransactions}
          />
        }
      >
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <TouchableOpacity
              key={tx.id}
              style={styles.transactionCard}
              onPress={() => router.push(`/asset/${tx.assetId}`)}
            >
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <View style={styles.symbolRow}>
                    <Text style={styles.transactionSymbol}>{tx.assetSymbol}</Text>
                    <View
                      style={[
                        styles.typeBadge,
                        tx.type === TransactionType.BUY
                          ? styles.buyBadge
                          : styles.sellBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeText,
                          tx.type === TransactionType.BUY
                            ? styles.buyText
                            : styles.sellText,
                        ]}
                      >
                        {tx.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.transactionName}>{tx.assetName}</Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(tx.timestamp, DATE_FORMATS.FULL)}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.textSecondary}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.transactionDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(tx.price)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity</Text>
                  <Text style={styles.detailValue}>
                    {formatQuantity(tx.quantity)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total Amount</Text>
                  <Text style={[styles.detailValue, styles.totalAmount]}>
                    {formatCurrency(tx.amount)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="receipt-outline"
              size={64}
              color={Colors.textLight}
            />
            <Text style={styles.emptyStateTitle}>No Transactions</Text>
            <Text style={styles.emptyStateText}>
              {filter === 'all'
                ? 'Your transaction history will appear here.'
                : `No ${filter} transactions yet.`}
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
  filterContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.textWhite,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  transactionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  transactionInfo: {
    flex: 1,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionSymbol: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  buyBadge: {
    backgroundColor: Colors.successLight + '20',
  },
  sellBadge: {
    backgroundColor: Colors.errorLight + '20',
  },
  typeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  buyText: {
    color: Colors.success,
  },
  sellText: {
    color: Colors.error,
  },
  transactionName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  transactionDetails: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
  },
  totalAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyStateTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
