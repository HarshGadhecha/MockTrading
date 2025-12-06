import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/src/context';
import { Card, Button, Input } from '@/src/components';
import { formatCurrency, formatQuantity } from '@/src/utils';
import {
  validateSellTransaction,
  calculateExitQuantityByPercentage,
  calculateExitQuantityByAmount,
  calculateAmount,
  calculateRealizedProfitLoss,
} from '@/src/utils/calculations';
import { Colors, Typography, Spacing, SELL_PERCENTAGE_OPTIONS } from '@/src/constants';
import { AssetCategory, SellMethod } from '@/src/types';

export default function SellModal() {
  const params = useLocalSearchParams<{
    assetId: string;
    symbol: string;
    name: string;
    category: string;
    currentPrice: string;
    availableQuantity: string;
    averagePrice: string;
  }>();

  const { executeSell } = useApp();
  const [sellMethod, setSellMethod] = useState<SellMethod>(SellMethod.PERCENTAGE);
  const [exitPrice, setExitPrice] = useState(params.currentPrice || '');
  const [exitPercentage, setExitPercentage] = useState('');
  const [exitAmount, setExitAmount] = useState('');
  const [exitQuantity, setExitQuantity] = useState('');
  const [selling, setSelling] = useState(false);

  const currentPrice = parseFloat(params.currentPrice || '0');
  const availableQuantity = parseFloat(params.availableQuantity || '0');
  const averagePrice = parseFloat(params.averagePrice || '0');
  const exitPriceNum = parseFloat(exitPrice) || 0;

  // Calculate exit quantity based on method
  let calculatedQuantity = 0;
  let calculatedAmount = 0;

  if (sellMethod === SellMethod.PERCENTAGE && exitPercentage) {
    calculatedQuantity = calculateExitQuantityByPercentage(
      availableQuantity,
      parseFloat(exitPercentage)
    );
    calculatedAmount = calculateAmount(calculatedQuantity, exitPriceNum);
  } else if (sellMethod === SellMethod.AMOUNT && exitAmount) {
    calculatedQuantity = calculateExitQuantityByAmount(
      parseFloat(exitAmount),
      exitPriceNum
    );
    calculatedAmount = parseFloat(exitAmount);
  } else if (sellMethod === SellMethod.QUANTITY && exitQuantity) {
    calculatedQuantity = parseFloat(exitQuantity);
    calculatedAmount = calculateAmount(calculatedQuantity, exitPriceNum);
  }

  const realizedPL = calculateRealizedProfitLoss(
    calculatedQuantity,
    averagePrice,
    exitPriceNum
  );

  const handleSell = async () => {
    const validation = validateSellTransaction(
      exitPriceNum,
      calculatedQuantity,
      availableQuantity
    );

    if (!validation.valid) {
      Alert.alert('Invalid Transaction', validation.error);
      return;
    }

    Alert.alert(
      'Confirm Sale',
      `Sell ${formatQuantity(calculatedQuantity)} ${params.symbol} for ${formatCurrency(calculatedAmount)}?\n\nRealized P/L: ${formatCurrency(realizedPL)}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            setSelling(true);
            try {
              await executeSell({
                assetId: params.assetId,
                assetSymbol: params.symbol,
                assetName: params.name,
                category: params.category as AssetCategory,
                exitPrice: exitPriceNum,
                quantity: calculatedQuantity,
                amount: calculatedAmount,
              });

              Alert.alert('Success', 'Asset sold successfully!', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sell asset');
            } finally {
              setSelling(false);
            }
          },
        },
      ]
    );
  };

  const setPercentageAndClear = (percentage: number) => {
    setSellMethod(SellMethod.PERCENTAGE);
    setExitPercentage(percentage.toString());
    setExitAmount('');
    setExitQuantity('');
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

        {/* Holdings Info */}
        <Card style={styles.holdingCard}>
          <View style={styles.holdingRow}>
            <View style={styles.holdingStat}>
              <Text style={styles.holdingLabel}>Available</Text>
              <Text style={styles.holdingValue}>
                {formatQuantity(availableQuantity)}
              </Text>
            </View>
            <View style={styles.holdingStat}>
              <Text style={styles.holdingLabel}>Avg Price</Text>
              <Text style={styles.holdingValue}>
                {formatCurrency(averagePrice)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Sell Method Tabs */}
        <View style={styles.methodTabs}>
          <TouchableOpacity
            style={[
              styles.methodTab,
              sellMethod === SellMethod.PERCENTAGE && styles.methodTabActive,
            ]}
            onPress={() => setSellMethod(SellMethod.PERCENTAGE)}
          >
            <Text
              style={[
                styles.methodTabText,
                sellMethod === SellMethod.PERCENTAGE && styles.methodTabTextActive,
              ]}
            >
              Percentage
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.methodTab,
              sellMethod === SellMethod.AMOUNT && styles.methodTabActive,
            ]}
            onPress={() => setSellMethod(SellMethod.AMOUNT)}
          >
            <Text
              style={[
                styles.methodTabText,
                sellMethod === SellMethod.AMOUNT && styles.methodTabTextActive,
              ]}
            >
              Amount
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.methodTab,
              sellMethod === SellMethod.QUANTITY && styles.methodTabActive,
            ]}
            onPress={() => setSellMethod(SellMethod.QUANTITY)}
          >
            <Text
              style={[
                styles.methodTabText,
                sellMethod === SellMethod.QUANTITY && styles.methodTabTextActive,
              ]}
            >
              Quantity
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sell Form */}
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>Sell Details</Text>

          <Input
            label="Exit Price"
            value={exitPrice}
            onChangeText={setExitPrice}
            placeholder="Enter price"
            keyboardType="numeric"
            leftElement={<Text style={styles.currencySymbol}>$</Text>}
          />

          {sellMethod === SellMethod.PERCENTAGE && (
            <>
              <Input
                label="Percentage to Sell"
                value={exitPercentage}
                onChangeText={setExitPercentage}
                placeholder="Enter percentage"
                keyboardType="numeric"
                rightElement={<Text style={styles.percentSymbol}>%</Text>}
              />
              <View style={styles.percentageButtons}>
                {SELL_PERCENTAGE_OPTIONS.map((pct) => (
                  <Button
                    key={pct}
                    title={`${pct}%`}
                    onPress={() => setPercentageAndClear(pct)}
                    variant="outline"
                    size="small"
                    style={styles.percentageButton}
                  />
                ))}
              </View>
            </>
          )}

          {sellMethod === SellMethod.AMOUNT && (
            <Input
              label="Exit Amount"
              value={exitAmount}
              onChangeText={(val) => {
                setExitAmount(val);
                setExitPercentage('');
                setExitQuantity('');
              }}
              placeholder="Enter amount"
              keyboardType="numeric"
              leftElement={<Text style={styles.currencySymbol}>$</Text>}
            />
          )}

          {sellMethod === SellMethod.QUANTITY && (
            <Input
              label="Quantity to Sell"
              value={exitQuantity}
              onChangeText={(val) => {
                setExitQuantity(val);
                setExitPercentage('');
                setExitAmount('');
              }}
              placeholder="Enter quantity"
              keyboardType="numeric"
            />
          )}

          {/* Calculated Values */}
          {calculatedQuantity > 0 && (
            <View style={styles.calculationCard}>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Quantity</Text>
                <Text style={styles.calculationValue}>
                  {formatQuantity(calculatedQuantity)}
                </Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Amount</Text>
                <Text style={styles.calculationValue}>
                  {formatCurrency(calculatedAmount)}
                </Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Realized P/L</Text>
                <Text
                  style={[
                    styles.calculationValue,
                    realizedPL >= 0 ? styles.profitText : styles.lossText,
                  ]}
                >
                  {formatCurrency(realizedPL)}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Summary */}
        {calculatedQuantity > 0 && (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Asset</Text>
              <Text style={styles.summaryValue}>{params.symbol}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Exit Price</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(exitPriceNum)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantity</Text>
              <Text style={styles.summaryValue}>
                {formatQuantity(calculatedQuantity)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>You'll Receive</Text>
              <Text style={styles.summaryTotalValue}>
                {formatCurrency(calculatedAmount)}
              </Text>
            </View>
          </Card>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Note: This is a virtual transaction. No real money will be received.
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
          title="Sell Now"
          onPress={handleSell}
          variant="error"
          style={styles.sellButton}
          loading={selling}
          disabled={!exitPrice || calculatedQuantity <= 0 || selling}
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
  holdingCard: {
    marginBottom: Spacing.md,
  },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  holdingStat: {
    alignItems: 'center',
  },
  holdingLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  holdingValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  methodTabs: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  methodTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 8,
    alignItems: 'center',
  },
  methodTabActive: {
    backgroundColor: Colors.primary,
  },
  methodTabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  methodTabTextActive: {
    color: Colors.textWhite,
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
  percentSymbol: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  percentageButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  percentageButton: {
    flex: 1,
  },
  calculationCard: {
    backgroundColor: Colors.backgroundGray,
    padding: Spacing.md,
    borderRadius: 10,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  calculationLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  calculationValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  profitText: {
    color: Colors.success,
  },
  lossText: {
    color: Colors.error,
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
  sellButton: {
    flex: 2,
  },
});
