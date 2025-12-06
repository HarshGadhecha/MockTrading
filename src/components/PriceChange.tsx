import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatPercentage } from '../utils';
import { Colors, Typography, Spacing } from '../constants/theme';

interface PriceChangeProps {
  value: number;
  percentage?: number;
  currency?: string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export const PriceChange: React.FC<PriceChangeProps> = ({
  value,
  percentage,
  currency = 'USD',
  size = 'medium',
  showIcon = true,
}) => {
  const isPositive = value >= 0;
  const color = isPositive ? Colors.success : Colors.error;
  const iconName = isPositive ? 'trending-up' : 'trending-down';

  const fontSize =
    size === 'small'
      ? Typography.fontSize.sm
      : size === 'large'
      ? Typography.fontSize.lg
      : Typography.fontSize.base;

  return (
    <View style={styles.container}>
      {showIcon && (
        <Ionicons
          name={iconName}
          size={fontSize}
          color={color}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, { color, fontSize }]}>
        {formatCurrency(value, currency)}
      </Text>
      {percentage !== undefined && (
        <Text style={[styles.text, { color, fontSize }]}>
          {' '}({formatPercentage(percentage)})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  text: {
    fontWeight: Typography.fontWeight.semibold,
  },
});
