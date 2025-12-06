import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from '../types';
import { formatCurrency, formatPercentage } from '../utils';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { PriceChange } from './PriceChange';

interface AssetItemProps {
  asset: Asset;
  onPress?: () => void;
  showCategory?: boolean;
}

export const AssetItem: React.FC<AssetItemProps> = ({
  asset,
  onPress,
  showCategory = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="trending-up"
            size={24}
            color={Colors.primary}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.symbol}>{asset.symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {asset.name}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.price}>
          {formatCurrency(asset.currentPrice)}
        </Text>
        {asset.priceChange !== undefined && asset.priceChangePercent !== undefined && (
          <PriceChange
            value={asset.priceChange}
            percentage={asset.priceChangePercent}
            size="small"
            showIcon={false}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  infoContainer: {
    flex: 1,
  },
  symbol: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  name: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
});
