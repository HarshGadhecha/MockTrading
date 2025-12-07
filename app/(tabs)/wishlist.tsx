import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/src/context';
import { Loading, PriceChange } from '@/src/components';
import { searchAssets, getCurrentPrices } from '@/src/services/marketData';
import { SearchResult, Asset } from '@/src/types';
import { formatCurrency, formatPercentage } from '@/src/utils';
import { Colors, Typography, Spacing } from '@/src/constants/theme';

export default function WishlistScreen() {
  const { favourites, loading, refreshing, refreshFavourites } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [favouritePrices, setFavouritePrices] = useState<Record<string, { price: number; change: number; changePercent: number }>>({});

  // Load favourite prices on mount and refresh
  useEffect(() => {
    loadFavouritePrices();

    // Refresh prices every 10 seconds
    const interval = setInterval(() => {
      loadFavouritePrices();
    }, 10000);

    return () => clearInterval(interval);
  }, [favourites]);

  const loadFavouritePrices = async () => {
    if (favourites.length === 0) return;

    const assetIds = favourites.map((fav) => fav.assetId);
    const response = await getCurrentPrices(assetIds);

    if (response.success && response.data) {
      // Fetch full asset details to get price changes
      const pricesWithChanges: Record<string, { price: number; change: number; changePercent: number }> = {};

      for (const fav of favourites) {
        const price = response.data[fav.assetId];
        if (price) {
          // For now, we'll use the price directly
          // In a real scenario, you'd fetch full details to get change data
          pricesWithChanges[fav.assetId] = {
            price,
            change: 0, // Will be updated with real data from API
            changePercent: 0,
          };
        }
      }

      setFavouritePrices(pricesWithChanges);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const response = await searchAssets(query);
    setSearching(false);

    if (response.success && response.data) {
      setSearchResults(response.data);
    }
  };

  if (loading) {
    return <Loading text="Loading favourites..." />;
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={Colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stocks, crypto, commodities..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshFavourites} />
        }
      >
        {/* Search Results */}
        {searchQuery.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {searching ? (
              <Loading text="Searching..." fullScreen={false} />
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <TouchableOpacity
                  key={result.assetId}
                  style={styles.assetItem}
                  onPress={() => router.push(`/asset/${result.assetId}`)}
                >
                  <View style={styles.assetInfo}>
                    <Text style={styles.assetSymbol}>{result.symbol}</Text>
                    <Text style={styles.assetName}>{result.name}</Text>
                  </View>
                  <View style={styles.assetStats}>
                    {result.currentPrice && (
                      <Text style={styles.assetPrice}>
                        {formatCurrency(result.currentPrice)}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No results found</Text>
            )}
          </View>
        )}

        {/* Favourites */}
        {searchQuery.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favourites</Text>
            {favourites.length > 0 ? (
              favourites.map((fav) => {
                const priceData = favouritePrices[fav.assetId];
                return (
                  <TouchableOpacity
                    key={fav.id}
                    style={styles.assetItem}
                    onPress={() => router.push(`/asset/${fav.assetId}`)}
                  >
                    <View style={styles.assetInfo}>
                      <View style={styles.assetHeader}>
                        <Text style={styles.assetSymbol}>{fav.symbol}</Text>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryText}>
                            {fav.category.replace('_', ' ')}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.assetName}>{fav.name}</Text>
                    </View>
                    <View style={styles.assetStats}>
                      {priceData ? (
                        <>
                          <Text style={styles.assetPrice}>
                            {formatCurrency(priceData.price)}
                          </Text>
                          {priceData.change !== 0 && (
                            <PriceChange
                              value={priceData.change}
                              percentage={priceData.changePercent}
                              size="small"
                              showIcon={false}
                            />
                          )}
                        </>
                      ) : (
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={Colors.textSecondary}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={64} color={Colors.textLight} />
                <Text style={styles.emptyStateTitle}>No Favourites Yet</Text>
                <Text style={styles.emptyStateText}>
                  Search for assets above and add them to your favourites to track
                  their prices.
                </Text>
              </View>
            )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 10,
    marginBottom: Spacing.sm,
  },
  assetInfo: {
    flex: 1,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  assetSymbol: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  categoryBadge: {
    backgroundColor: Colors.backgroundGray,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  assetName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  assetStats: {
    alignItems: 'flex-end',
  },
  assetPrice: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
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
