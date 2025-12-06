import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/src/context';
import { Card, Button, Input } from '@/src/components';
import { formatCurrency, formatQuantity } from '@/src/utils';
import { validateBuyTransaction, calculateQuantity } from '@/src/utils/calculations';
import { Colors, Typography, Spacing } from '@/src/constants';
import { AssetCategory } from '@/src/types';

export default function BuyModal() {
  const params = useLocalSearchParams<{
    assetId: string;
    symbol: string;
    name: string;
    category: string;
    currentPrice: string;
  }>();

  const { wallet, executeBuy } = useApp();
  const [entryPrice, setEntryPrice] = useState(params.currentPrice || '');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [buying, setBuying] = useState(false);

  const currentPrice = parseFloat(params.currentPrice || '0');
  const entryPriceNum = parseFloat(entryPrice) || 0;
  const investmentAmountNum = parseFloat(investmentAmount) || 0;
  const calculatedQuantity = calculateQuantity(investmentAmountNum, entryPriceNum);

  const handleBuy = async () => {
    const validation = validateBuyTransaction(
      entryPriceNum,
      investmentAmountNum,
      wallet?.currentBalance || 0
    );

    if (!validation.valid) {
      Alert.alert('Invalid Transaction', validation.error);
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Buy ${formatQuantity(calculatedQuantity)} ${params.symbol} for ${formatCurrency(investmentAmountNum)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            setBuying(true);
            try {
              await executeBuy({
                assetId: params.assetId,
                assetSymbol: params.symbol,
                assetName: params.name,
                category: params.category as AssetCategory,
                entryPrice: entryPriceNum,
                quantity: calculatedQuantity,
                amount: investmentAmountNum,
              });

              Alert.alert('Success', 'Asset purchased successfully!', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to purchase asset');
            } finally {
              setBuying(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.content}>
        {/* Asset Info */}
        <Card style={styles.assetCard}>
          <Text style={styles.assetSymbol}>{params.symbol}</Text>
          <Text style={styles.assetName}>{params.name}</Text>
          <Text style={styles.currentPrice}>
            Current Price: {formatCurrency(currentPrice)}
          </Text>
        </Card>

        {/* Wallet Balance */}
        <Card style={styles.walletCard}>
          <View style={styles.walletRow}>
            <Text style={styles.walletLabel}>Available Balance</Text>
            <Text style={styles.walletBalance}>
              {formatCurrency(wallet?.currentBalance || 0)}
            </Text>
          </View>
        </Card>

        {/* Buy Form */}
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>Buy Details</Text>

          <Input
            label="Entry Price"
            value={entryPrice}
            onChangeText={setEntryPrice}
            placeholder="Enter price"
            keyboardType="numeric"
            leftElement={<Text style={styles.currencySymbol}>$</Text>}
          />

          <Input
            label="Investment Amount"
            value={investmentAmount}
            onChangeText={setInvestmentAmount}
            placeholder="Enter amount"
            keyboardType="numeric"
            leftElement={<Text style={styles.currencySymbol}>$</Text>}
          />

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmounts}>
            <Text style={styles.quickAmountsLabel}>Quick amounts:</Text>
            <View style={styles.quickAmountsRow}>
              {[100, 500, 1000, 5000].map((amount) => (
                <Button
                  key={amount}
                  title={`$${amount}`}
                  onPress={() => setInvestmentAmount(amount.toString())}
                  variant="outline"
                  size="small"
                  style={styles.quickAmountButton}
                />
              ))}
            </View>
          </View>

          {/* Calculated Quantity */}
          {entryPriceNum > 0 && investmentAmountNum > 0 && (
            <View style={styles.calculationCard}>
              <Text style={styles.calculationLabel}>Quantity</Text>
              <Text style={styles.calculationValue}>
                {formatQuantity(calculatedQuantity)} {params.symbol}
              </Text>
              <Text style={styles.calculationSubtext}>
                @ {formatCurrency(entryPriceNum)} per unit
              </Text>
            </View>
          )}
        </Card>

        {/* Summary */}
        {entryPriceNum > 0 && investmentAmountNum > 0 && (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Asset</Text>
              <Text style={styles.summaryValue}>{params.symbol}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(entryPriceNum)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantity</Text>
              <Text style={styles.summaryValue}>
                {formatQuantity(calculatedQuantity)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Total Amount</Text>
              <Text style={styles.summaryTotalValue}>
                {formatCurrency(investmentAmountNum)}
              </Text>
            </View>
          </Card>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Note: This is a virtual transaction. No real money will be used.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          style={styles.cancelButton}
        />
        <Button
          title="Buy Now"
          onPress={handleBuy}
          variant="success"
          style={styles.buyButton}
          loading={buying}
          disabled={!entryPrice || !investmentAmount || buying}
        />
      </View>
    </KeyboardAvoidingView>
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
  assetCard: {
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  assetSymbol: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  assetName: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  currentPrice: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  walletCard: {
    marginBottom: Spacing.md,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  walletBalance: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  formCard: {
    marginBottom: Spacing.md,
  },
  formTitle: {
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
  quickAmounts: {
    marginBottom: Spacing.md,
  },
  quickAmountsLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickAmountButton: {
    flex: 1,
  },
  calculationCard: {
    backgroundColor: Colors.backgroundGray,
    padding: Spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  calculationLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  calculationValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginVertical: Spacing.xs,
  },
  calculationSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  summaryCard: {
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
  },
  summaryTotalLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  summaryTotalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.success,
  },
  disclaimer: {
    marginBottom: Spacing.md,
  },
  disclaimerText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  cancelButton: {
    flex: 1,
  },
  buyButton: {
    flex: 2,
  },
});
