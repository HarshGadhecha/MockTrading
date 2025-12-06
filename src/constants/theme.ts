// Color Constants
export const Colors = {
  // Primary Colors
  primary: '#3B82F6', // Blue
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',

  // Success/Profit Colors
  success: '#10B981', // Green
  successDark: '#059669',
  successLight: '#34D399',

  // Error/Loss Colors
  error: '#EF4444', // Red
  errorDark: '#DC2626',
  errorLight: '#F87171',

  // Warning Colors
  warning: '#F59E0B', // Amber
  warningDark: '#D97706',
  warningLight: '#FBBF24',

  // Info Colors
  info: '#0EA5E9', // Sky Blue
  infoDark: '#0284C7',
  infoLight: '#38BDF8',

  // Background Colors
  background: '#FFFFFF',
  backgroundDark: '#F9FAFB',
  backgroundGray: '#F3F4F6',

  // Text Colors
  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textWhite: '#FFFFFF',

  // Border Colors
  border: '#E5E7EB',
  borderDark: '#D1D5DB',
  borderLight: '#F3F4F6',

  // Card Colors
  card: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.05)',

  // Asset Category Colors
  stocks: '#3B82F6',
  crypto: '#F59E0B',
  commodities: '#8B5CF6',

  // Chart Colors
  chartGrid: '#E5E7EB',
  chartAxis: '#9CA3AF',
  chartCandle: {
    up: '#10B981',
    down: '#EF4444',
  },

  // Tab Bar
  tabBarActive: '#3B82F6',
  tabBarInactive: '#9CA3AF',
  tabBarBackground: '#FFFFFF',

  // Modal
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  modalBackground: '#FFFFFF',
};

// Typography
export const Typography = {
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border Radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadow
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Screen Dimensions
export const Layout = {
  maxWidth: 1200,
  tabBarHeight: 60,
  headerHeight: 56,
  cardMinHeight: 80,
};

// Animation Durations
export const Animation = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Default Theme Export
export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadow: Shadow,
  layout: Layout,
  animation: Animation,
};

export default Theme;
