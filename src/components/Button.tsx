import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.borderDark;
    switch (variant) {
      case 'primary':
        return Colors.primary;
      case 'secondary':
        return Colors.backgroundGray;
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.error;
      case 'outline':
        return 'transparent';
      default:
        return Colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.textLight;
    if (variant === 'outline') return Colors.primary;
    if (variant === 'secondary') return Colors.text;
    return Colors.textWhite;
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md };
      case 'large':
        return { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl };
      default:
        return { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return Typography.fontSize.sm;
      case 'large':
        return Typography.fontSize.lg;
      default:
        return Typography.fontSize.base;
    }
  };

  const buttonStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    ...getPadding(),
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...(variant === 'outline' && {
      borderWidth: 1,
      borderColor: disabled ? Colors.borderDark : Colors.primary,
    }),
  };

  const buttonTextStyle: TextStyle = {
    color: getTextColor(),
    fontSize: getFontSize(),
    fontWeight: Typography.fontWeight.semibold,
  };

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[buttonTextStyle, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({});
