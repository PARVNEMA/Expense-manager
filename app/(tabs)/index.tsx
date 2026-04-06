import { useEffect, useMemo, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '@/components/header';
import { useTheme } from '@/context/ThemeContext';
import { useExpenses, Transaction } from '@/context/ExpenseContext';
import { getCategoryMeta } from '@/constants/transactionCategories';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const monthLabel = new Date().toLocaleDateString('en-US', {
  month: 'long',
  year: 'numeric',
});

export default function Dashboard() {
  const { theme } = useTheme();
  const { transactions, deleteTransaction, getMonthlySummary, getCategoryTotals, isLoaded } =
    useExpenses();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const isDark = theme === 'dark';

  const palette = useMemo(
    () =>
      isDark
        ? {
            background: '#0b1220',
            card: '#111827',
            border: '#1f2937',
            text: '#f8fafc',
            muted: '#94a3b8',
            emptyBg: '#172036',
            incomeBg: '#0b3a31',
            expenseBg: '#401818',
          }
        : {
            background: '#f8fafc',
            card: '#ffffff',
            border: '#e2e8f0',
            text: '#0f172a',
            muted: '#64748b',
            emptyBg: '#f1f5f9',
            incomeBg: '#d1fae5',
            expenseBg: '#fee2e2',
          },
    [isDark],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide]);

  const summary = getMonthlySummary();
  const monthExpensesByCategory = getCategoryTotals('expense');
  const totalCategoryExpenses = monthExpensesByCategory.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  const formatDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const meta = getCategoryMeta(item.category);
    const tone = isDark ? meta.dark : meta.light;
    const amountPrefix = item.type === 'income' ? '+' : '-';

    return (
      <View
        style={{
          backgroundColor: palette.card,
          borderColor: palette.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 14,
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
          <View style={{ flexDirection: 'row', flex: 1, gap: 10 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: `${tone}22`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name={meta.icon} size={18} color={tone} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.text, fontSize: 16, fontWeight: '700' }} numberOfLines={1}>
                {item.note}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 8 }}>
                <View
                  style={{
                    backgroundColor: `${tone}20`,
                    borderRadius: 999,
                    paddingHorizontal: 9,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: tone, fontWeight: '700', fontSize: 12 }}>{item.category}</Text>
                </View>
                <Text style={{ color: palette.muted, fontSize: 12 }}>{formatDate(item.date)}</Text>
              </View>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text
              style={{
                color: item.type === 'income' ? '#10b981' : '#ef4444',
                fontSize: 16,
                fontWeight: '800',
              }}
            >
              {amountPrefix}
              {currency.format(item.amount)}
            </Text>
            <TouchableOpacity
              onPress={() => deleteTransaction(item.id)}
              style={{
                marginTop: 8,
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 5,
                backgroundColor: isDark ? '#3f1d1d' : '#fee2e2',
              }}
            >
              <Text style={{ color: isDark ? '#fecaca' : '#b91c1c', fontWeight: '700', fontSize: 12 }}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: slide }] }}>
        <Header title="FinTrack" description="Your personal finance dashboard" />

        <View style={{ marginHorizontal: 20, marginBottom: 14 }}>
          <LinearGradient
            colors={isDark ? ['#0f766e', '#2563eb'] : ['#22c55e', '#0ea5e9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 22, padding: 18 }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>{monthLabel}</Text>
            <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 2 }}>
              {currency.format(summary.balance)}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Remaining balance</Text>
          </LinearGradient>
        </View>

        <View style={{ marginHorizontal: 20, flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <View
            style={{
              flex: 1,
              borderRadius: 14,
              padding: 12,
              backgroundColor: palette.incomeBg,
            }}
          >
            <Text style={{ color: '#065f46', fontWeight: '700', fontSize: 12 }}>Income</Text>
            <Text style={{ color: '#065f46', fontWeight: '800', marginTop: 2 }}>
              {currency.format(summary.totalIncome)}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              borderRadius: 14,
              padding: 12,
              backgroundColor: palette.expenseBg,
            }}
          >
            <Text style={{ color: '#991b1b', fontWeight: '700', fontSize: 12 }}>Expenses</Text>
            <Text style={{ color: '#991b1b', fontWeight: '800', marginTop: 2 }}>
              {currency.format(summary.totalExpenses)}
            </Text>
          </View>
        </View>

        {monthExpensesByCategory.length > 0 ? (
          <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
            <Text style={{ color: palette.text, fontWeight: '700', marginBottom: 8 }}>
              Expense categories this month
            </Text>
            {monthExpensesByCategory.slice(0, 4).map((item) => {
              const meta = getCategoryMeta(item.category);
              const tone = isDark ? meta.dark : meta.light;
              const widthPct = totalCategoryExpenses
                ? Math.max((item.amount / totalCategoryExpenses) * 100, 4)
                : 0;

              return (
                <View key={item.category} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: palette.muted, fontSize: 12 }}>{item.category}</Text>
                    <Text style={{ color: palette.muted, fontSize: 12 }}>
                      {currency.format(item.amount)}
                    </Text>
                  </View>
                  <View
                    style={{
                      marginTop: 4,
                      width: '100%',
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: isDark ? '#1f2937' : '#e2e8f0',
                    }}
                  >
                    <View
                      style={{
                        width: `${widthPct}%`,
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: tone,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {!isLoaded ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: palette.muted }}>Loading local data...</Text>
          </View>
        ) : transactions.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26 }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: palette.emptyBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons
                name="chart-donut-variant"
                size={36}
                color={isDark ? '#94a3b8' : '#64748b'}
              />
            </View>
            <Text style={{ color: palette.text, fontSize: 20, fontWeight: '700', marginTop: 14 }}>
              No transactions yet
            </Text>
            <Text style={{ color: palette.muted, textAlign: 'center', marginTop: 6 }}>
              Add your first income or expense from the Add Transaction tab to unlock monthly summaries.
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1, marginHorizontal: 20 }}>
            <Text style={{ color: palette.text, fontWeight: '700', marginBottom: 10 }}>
              Recent transactions
            </Text>
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={renderTransaction}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        )}
      </Animated.View>
    </View>
  );
}
