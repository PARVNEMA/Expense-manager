import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { ThemeProvider } from '@/context/ThemeContext';
import '../global.css';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <ExpenseProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="dark" />
      </ExpenseProvider>
    </ThemeProvider>
  );
}
