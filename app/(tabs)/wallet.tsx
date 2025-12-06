import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useApp } from '@/src/context';
import { Card, Button, Input, Loading } from '@/src/components';
import { formatCurrency, formatDate, formatRelativeTime } from '@/src/utils';
import { getWalletTransactions } from '@/src/database/services';
import { WalletTransaction } from '@/src/types';
import { Colors, Typography, Spacing, DATE_FORMATS } from '@/src/constants';

export default function WalletScreen() {
  const { wallet, loading, refreshing, refreshWallet, addFunds } = useApp();
  const [amount, setAmount] = useState('');
  const [adding, setAdding] = useState(false);
  const [walletTxs, setWalletTxs] = useState<WalletTransaction[]>([]);

  const loadWalletTransactions = async () => {
    const txs = await getWalletTransactions(20);
    setWalletTxs(txs);
  };

  React.useEffect(() => {
    loadWalletTransactions();
  }, [wallet]);

  const handleAddFunds = async () => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (numAmount > 1000000) {
      Alert.alert('Limit Exceeded', 'Maximum amount is $1,000,000');
      return;
    }

    setAdding(true);
    try {
      await addFunds(numAmount);
      setAmount('');
      Alert.alert('Success', `${formatCurrency(numAmount)} added to your wallet`);
      await loadWalletTransactions();
    } catch (error) {
      Alert.alert('Error', 'Failed to add funds. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleRefresh = async () => {
    await refreshWallet();
    await loadWalletTransactions();
  };

  if (loading) {
    return <Loading text="Loading wallet..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Wallet Balance Card */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>
            {formatCurrency(wallet?.currentBalance || 0)}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Added</Text>
              <Text style={styles.statValue}>
                {formatCurrency(wallet?.totalFundsAdded || 0)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Used</Text>
              <Text style={styles.statValue}>
                {formatCurrency(wallet?.totalFundsUsed || 0)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Add Funds Card */}
        <Card style={styles.addFundsCard}>
          <Text style={styles.cardTitle}>Add Virtual Funds</Text>
          <Input
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            keyboardType="numeric"
            leftElement={
              <Text style={styles.currencySymbol}>$</Text>
            }
          />
          <Button
            title="Add Funds"
            onPress={handleAddFunds}
            loading={adding}
            disabled={!amount}
          />
          <Text style={styles.disclaimer}>
            Note: These are virtual funds for practice trading only.
          </Text>
        </Card>

        {/* Transaction History */}
        {walletTxs.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {walletTxs.map((tx) => (
              <View key={tx.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <View style={styles.transactionHeader}>
                    <Text
                      style={[
                        styles.transactionType,
                        tx.type === 'add'
                          ? styles.addType
                          : styles.deductType,
                      ]}
                    >
                      {tx.type === 'add' ? '+ ' : '- '}
                      {formatCurrency(tx.amount)}
                    </Text>
                  </View>
                  <Text style={styles.transactionDescription}>
                    {tx.description}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatRelativeTime(tx.timestamp)}
                  </Text>
                </View>
                <View style={styles.transactionBalance}>
                  <Text style={styles.balanceAfterLabel}>Balance</Text>
                  <Text style={styles.balanceAfterValue}>
                    {formatCurrency(tx.balanceAfter)}
                  </Text>
                </View>
              </View>
            ))}
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
  balanceCard: {
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  balanceValue: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
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
  addFundsCard: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  currencySymbol: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  disclaimer: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  historySection: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 10,
    marginBottom: Spacing.sm,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionHeader: {
    marginBottom: 4,
  },
  transactionType: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  addType: {
    color: Colors.success,
  },
  deductType: {
    color: Colors.error,
  },
  transactionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textLight,
  },
  transactionBalance: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  balanceAfterLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  balanceAfterValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
});
