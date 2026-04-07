import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Svg, { Circle, Path } from 'react-native-svg';
import Header from '@/components/header';
import { useTheme } from '@/context/ThemeContext';
import { useExpenses, Transaction } from '@/context/ExpenseContext';
import { getCategoryMeta } from '@/constants/transactionCategories';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getToday = () => formatDateKey(new Date());

const getMonthStart = () => {
  const now = new Date();
  return formatDateKey(new Date(now.getFullYear(), now.getMonth(), 1));
};

interface PieSlice {
  label: string;
  value: number;
  color: string;
}

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const buildSlicePath = (
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
};

export default function Dashboard() {
  const { theme } = useTheme();
  const { transactions, deleteTransaction, isLoaded } = useExpenses();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const [startDate, setStartDate] = useState(getMonthStart());
  const [endDate, setEndDate] = useState(getToday());
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(
    null,
  );
  const isDark = theme === 'dark';

  const palette = useMemo(
    () =>
      isDark
        ? {
            background: '#0a0d14',
            card: '#111827',
            border: '#1f2937',
            text: '#f8fafc',
            muted: '#94a3b8',
            emptyBg: '#172036',
            incomeBg: '#123d35',
            expenseBg: '#3b1c1c',
          }
        : {
            background: '#f8fafc',
            card: '#ffffff',
            border: '#e2e8f0',
            text: '#0f172a',
            muted: '#64748b',
            emptyBg: '#f1f5f9',
            incomeBg: '#123d35',
            expenseBg: '#BD1313',
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

  const startDateObj = useMemo(
    () => new Date(`${startDate}T00:00:00`),
    [startDate],
  );
  const endDateObj = useMemo(() => new Date(`${endDate}T23:59:59`), [endDate]);

  const periodMeta = useMemo(() => {
    const label = `${startDateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} - ${endDateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;

    return { periodStart: startDateObj, periodEnd: endDateObj, label };
  }, [endDateObj, startDateObj]);

  const periodTransactions = useMemo(
    () =>
      transactions.filter((entry) => {
        const txDate = new Date(`${entry.date}T00:00:00`);
        return (
          txDate >= periodMeta.periodStart && txDate <= periodMeta.periodEnd
        );
      }),
    [periodMeta.periodEnd, periodMeta.periodStart, transactions],
  );

  const summary = useMemo(
    () =>
      periodTransactions.reduce(
        (acc, entry) => {
          if (entry.type === 'income') {
            acc.totalIncome += entry.amount;
          } else {
            acc.totalExpenses += entry.amount;
          }
          acc.balance = acc.totalIncome - acc.totalExpenses;
          return acc;
        },
        { totalIncome: 0, totalExpenses: 0, balance: 0 },
      ),
    [periodTransactions],
  );

  const periodExpensesByCategory = useMemo(() => {
    const totals = new Map<
      string,
      { category: string; amount: number; count: number }
    >();

    periodTransactions
      .filter((entry) => entry.type === 'expense')
      .forEach((entry) => {
        const current = totals.get(entry.category);
        if (!current) {
          totals.set(entry.category, {
            category: entry.category,
            amount: entry.amount,
            count: 1,
          });
          return;
        }
        totals.set(entry.category, {
          category: entry.category,
          amount: current.amount + entry.amount,
          count: current.count + 1,
        });
      });

    return [...totals.values()].sort((a, b) => b.amount - a.amount);
  }, [periodTransactions]);

  const pieSlices = useMemo<PieSlice[]>(() => {
    const expenseSlices = periodExpensesByCategory
      .filter((entry) => entry.amount > 0)
      .map((entry) => {
        const meta = getCategoryMeta(entry.category);
        return {
          label: entry.category,
          value: entry.amount,
          color: isDark ? meta.dark : meta.light,
        };
      });

    const remaining = Math.max(summary.balance, 0);
    if (remaining > 0) {
      expenseSlices.push({
        label: 'Remaining',
        value: remaining,
        color: '#22c55e',
      });
    }

    return expenseSlices;
  }, [periodExpensesByCategory, summary.balance, isDark]);

  const totalPieValue = pieSlices.reduce((sum, slice) => sum + slice.value, 0);

  const formatDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed' || !selectedDate || !pickerTarget) {
      setPickerTarget(null);
      return;
    }

    const selected = formatDateKey(selectedDate);
    if (pickerTarget === 'start') {
      setStartDate(selected);
      if (selected > endDate) {
        setEndDate(selected);
      }
    } else {
      setEndDate(selected);
      if (selected < startDate) {
        setStartDate(selected);
      }
    }

    setPickerTarget(null);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const meta = getCategoryMeta(item.category);
    const tone = isDark ? meta.dark : meta.light;
    const amountPrefix = item.type === 'income' ? '+' : '-';

    return (
      <View
        className="rounded-2xl p-3.5 mb-2.5 border"
        style={{
          backgroundColor: palette.card,
          borderColor: palette.border,
        }}
      >
        <View className="flex-row justify-between gap-2.5">
          <View className="flex-row flex-1 gap-2.5">
            <View
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: `${tone}22` }}
            >
              <MaterialCommunityIcons name={meta.icon} size={18} color={tone} />
            </View>

            <View className="flex-1">
              <Text
                className="text-base font-bold"
                style={{ color: palette.text }}
                numberOfLines={1}
              >
                {item.note}
              </Text>

              <View className="flex-row items-center mt-1.5 gap-2">
                <View
                  className="rounded-full px-2 py-1"
                  style={{ backgroundColor: `${tone}20` }}
                >
                  <Text className="text-xs font-bold" style={{ color: tone }}>
                    {item.category}
                  </Text>
                </View>

                <Text className="text-xs" style={{ color: palette.muted }}>
                  {formatDate(item.date)}
                </Text>
              </View>
            </View>
          </View>

          <View className="items-end">
            <Text
              className="text-base font-extrabold"
              style={{
                color: item.type === 'income' ? '#10b981' : '#ef4444',
              }}
            >
              {amountPrefix}
              {currency.format(item.amount)}
            </Text>

            <TouchableOpacity
              onPress={() => deleteTransaction(item.id)}
              className="mt-2 rounded-lg px-2 py-1"
              style={{
                backgroundColor: isDark ? '#3f1d1d' : '#fee2e2',
              }}
            >
              <Text
                className="text-xs font-bold"
                style={{
                  color: isDark ? '#fecaca' : '#b91c1c',
                }}
              >
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
      <Animated.ScrollView
        style={{ flex: 1, opacity: fade, transform: [{ translateY: slide }] }}
      >
        <Header
          title="FinTrack"
          description="Your personal finance dashboard"
        />

        <View style={{ marginHorizontal: 20, marginBottom: 14 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 10,
              backgroundColor: palette.card,
              borderWidth: 1,
              borderColor: palette.border,
              borderRadius: 14,
              padding: 8,
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => setPickerTarget('start')}
              style={{
                flex: 1,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: palette.border,
                paddingVertical: 9,
                paddingHorizontal: 14,
                backgroundColor: palette.background,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: palette.muted,
                  fontWeight: '700',
                }}
              >
                START DATE
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: palette.text,
                  marginTop: 2,
                }}
              >
                {formatDate(startDate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPickerTarget('end')}
              style={{
                flex: 1,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: palette.border,
                paddingVertical: 9,
                paddingHorizontal: 14,
                backgroundColor: palette.background,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: palette.muted,
                  fontWeight: '700',
                }}
              >
                END DATE
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: palette.text,
                  marginTop: 2,
                }}
              >
                {formatDate(endDate)}
              </Text>
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={isDark ? ['#0f766e', '#2563eb'] : ['#22c55e', '#0ea5e9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 22, padding: 18 }}
          >
            <Text
              style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}
            >
              {periodMeta.label}
            </Text>
            <Text
              style={{
                color: '#fff',
                fontSize: 30,
                fontWeight: '800',
                marginTop: 2,
              }}
            >
              {currency.format(summary.balance)}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
              Balance for selected date range
            </Text>
          </LinearGradient>
        </View>

        <View
          style={{
            marginHorizontal: 20,
            flexDirection: 'row',
            gap: 10,
            marginBottom: 14,
          }}
        >
          <View
            style={{
              flex: 1,
              borderRadius: 14,
              padding: 12,
              backgroundColor: palette.incomeBg,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>
              Income
            </Text>
            <Text style={{ color: 'white', fontWeight: '800', marginTop: 2 }}>
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
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>
              Expenses
            </Text>
            <Text style={{ color: 'white', fontWeight: '800', marginTop: 2 }}>
              {currency.format(summary.totalExpenses)}
            </Text>
          </View>
        </View>

        {pieSlices.length > 0 ? (
          <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
            <Text
              style={{
                color: palette.text,
                fontWeight: '700',
                marginBottom: 8,
              }}
            >
              Expense breakdown + remaining
            </Text>
            <View
              style={{
                backgroundColor: palette.card,
                borderWidth: 1,
                borderColor: palette.border,
                borderRadius: 16,
                padding: 12,
              }}
            >
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <Svg width={180} height={180} viewBox="0 0 180 180">
                  {(() => {
                    let cumulative = 0;
                    return pieSlices.map((slice) => {
                      const startAngle = totalPieValue
                        ? (cumulative / totalPieValue) * 360
                        : 0;
                      cumulative += slice.value;
                      const endAngle = totalPieValue
                        ? (cumulative / totalPieValue) * 360
                        : 0;
                      const path = buildSlicePath(
                        90,
                        90,
                        82,
                        startAngle,
                        endAngle,
                      );

                      return (
                        <Path key={slice.label} d={path} fill={slice.color} />
                      );
                    });
                  })()}
                  <Circle
                    cx={90}
                    cy={90}
                    r={42}
                    fill={isDark ? palette.background : '#ffffff'}
                  />
                </Svg>
              </View>

              {pieSlices.map((slice) => (
                <View
                  key={slice.label}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 7,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: slice.color,
                      }}
                    />
                    <Text style={{ color: palette.muted, fontSize: 12 }}>
                      {slice.label}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: palette.text,
                      fontWeight: '700',
                      fontSize: 12,
                    }}
                  >
                    {currency.format(slice.value)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {!isLoaded ? (
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: palette.muted }}>Loading local data...</Text>
          </View>
        ) : periodTransactions.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 26,
            }}
          >
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
            <Text
              style={{
                color: palette.text,
                fontSize: 20,
                fontWeight: '700',
                marginTop: 14,
              }}
            >
              No transactions yet
            </Text>
            <Text
              style={{
                color: palette.muted,
                textAlign: 'center',
                marginTop: 6,
              }}
            >
              No records found in this date range. Try changing start/end dates.
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1, marginHorizontal: 20 }}>
            <Text
              style={{
                color: palette.text,
                fontWeight: '700',
                marginBottom: 10,
              }}
            >
              Transactions in selected range
            </Text>
            <FlatList
              data={periodTransactions}
              keyExtractor={(item) => item.id}
              renderItem={renderTransaction}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              scrollEnabled={false}
            />
          </View>
        )}
      </Animated.ScrollView>

      {pickerTarget ? (
        <DateTimePicker
          value={pickerTarget === 'start' ? startDateObj : endDateObj}
          mode="date"
          display="default"
          themeVariant="light"
          onChange={onDateChange}
          maximumDate={pickerTarget === 'start' ? endDateObj : undefined}
          minimumDate={pickerTarget === 'end' ? startDateObj : undefined}
        />
      ) : null}
    </View>
  );
}
