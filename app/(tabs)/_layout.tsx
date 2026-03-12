import { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { Wallet, CirclePlus as PlusCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () =>
      isDark
        ? {
            pageBg: '#0b1220',
            tabBg: '#111827',
            tabBorder: '#1f2937',
            active: '#22c55e',
            inactive: '#94a3b8',
          }
        : {
            pageBg: '#f8fafc',
            tabBg: '#ffffff',
            tabBorder: '#e2e8f0',
            active: '#10b981',
            inactive: '#64748b',
          },
    [isDark],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? '#000000' : palette.pageBg }}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: palette.active,
          tabBarInactiveTintColor: palette.inactive,
          tabBarStyle: {
            backgroundColor: palette.tabBg,
            borderTopWidth: 1,
            borderTopColor: palette.tabBorder,
            paddingBottom: 8,
            paddingTop: 8,
            height: 70,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ size, color }) => (
              <Wallet size={size} color={color} strokeWidth={2.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: 'Add Expense',
            tabBarIcon: ({ size, color }) => (
              <PlusCircle size={size} color={color} strokeWidth={2.5} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
