import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppProvider } from '@/src/context';
import { initDatabase } from '@/src/database';
import { Loading } from '@/src/components';

export default function RootLayout() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError('Failed to initialize app. Please restart.');
      }
    };

    initialize();
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!dbInitialized) {
    return <Loading text="Initializing app..." />;
  }

  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="asset/[id]"
          options={{
            headerShown: true,
            title: 'Asset Details',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="modals/buy"
          options={{
            presentation: 'modal',
            title: 'Buy Asset',
          }}
        />
        <Stack.Screen
          name="modals/sell"
          options={{
            presentation: 'modal',
            title: 'Sell Asset',
          }}
        />
      </Stack>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
