import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Trash2,
  TrendingUp,
  Calendar,
  Wallet,
  Pencil,
  Moon,
  Sun,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/context/ThemeContext';
import { useExpenses } from '@/context/ExpenseContext';
import type { Expense } from '@/context/ExpenseContext';

export default function Dashboard() {
  const { expenses, deleteExpense, getTotalExpenses } = useExpenses();
  const { theme, toggleTheme } = useTheme();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [_, setForceUpdate] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isDark = theme === 'dark';

  const colors = useMemo(
    () =>
      isDark
        ? {
            background: '#0b1220',
            surface: '#111827',
            surfaceBorder: '#1f2937',
            textPrimary: '#f8fafc',
            textSecondary: '#94a3b8',
            muted: '#64748b',
            emptyIconBg: '#1e293b',
            deleteBtnBg: '#3f1d1d',
            editBtnBg: '#1d2c49',
            modalOverlay: 'rgba(2, 6, 23, 0.7)',
            inputBg: '#0f172a',
            inputBorder: '#334155',
            inputText: '#f8fafc',
            placeholder: '#64748b',
            toggleBg: '#172036',
            toggleBorder: '#334155',
            toggleText: '#e2e8f0',
          }
        : {
            background: '#f8fafc',
            surface: '#ffffff',
            surfaceBorder: '#e2e8f0',
            textPrimary: '#0f172a',
            textSecondary: '#475569',
            muted: '#64748b',
            emptyIconBg: '#e2e8f0',
            deleteBtnBg: '#fee2e2',
            editBtnBg: '#dbeafe',
            modalOverlay: 'rgba(15, 23, 42, 0.25)',
            inputBg: '#f8fafc',
            inputBorder: '#cbd5e1',
            inputText: '#0f172a',
            placeholder: '#94a3b8',
            toggleBg: '#ffffff',
            toggleBorder: '#cbd5e1',
            toggleText: '#0f172a',
          },
    [isDark],
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleEdit = (expense: Expense) => {
    setEditExpense(expense);
    setEditTitle(expense.title);
    setEditAmount(expense.amount.toString());
    setEditModalVisible(true);
  };

  const handleEditSave = () => {
    if (!editExpense) return;
    if (!editTitle.trim() || !editAmount || parseFloat(editAmount) <= 0) {
      Alert.alert('Error', 'Please enter valid details');
      return;
    }

    editExpense.title = editTitle.trim();
    editExpense.amount = parseFloat(editAmount);
    setEditModalVisible(false);
    setForceUpdate((v) => v + 1);
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const getCategoryChip = (category: string) => {
    const map: Record<
      string,
      { bgLight: string; textLight: string; bgDark: string; textDark: string }
    > = {
      Food: {
        bgLight: '#ffedd5',
        textLight: '#c2410c',
        bgDark: '#3a2611',
        textDark: '#fdba74',
      },
      Transport: {
        bgLight: '#dbeafe',
        textLight: '#1d4ed8',
        bgDark: '#14233e',
        textDark: '#93c5fd',
      },
      Shopping: {
        bgLight: '#f3e8ff',
        textLight: '#7e22ce',
        bgDark: '#331a4d',
        textDark: '#d8b4fe',
      },
      Entertainment: {
        bgLight: '#fce7f3',
        textLight: '#be185d',
        bgDark: '#431b34',
        textDark: '#f9a8d4',
      },
      Bills: {
        bgLight: '#fee2e2',
        textLight: '#b91c1c',
        bgDark: '#441b1b',
        textDark: '#fca5a5',
      },
      Health: {
        bgLight: '#dcfce7',
        textLight: '#15803d',
        bgDark: '#163324',
        textDark: '#86efac',
      },
      Other: {
        bgLight: '#e2e8f0',
        textLight: '#334155',
        bgDark: '#283547',
        textDark: '#cbd5e1',
      },
    };

    const resolved = map[category] ?? map.Other;
    return isDark
      ? { backgroundColor: resolved.bgDark, color: resolved.textDark }
      : { backgroundColor: resolved.bgLight, color: resolved.textLight };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <View className="px-6 pt-2 pb-4 flex-row justify-between items-center">
          <View>
            <Text
              style={{ color: colors.textPrimary }}
              className="text-3xl font-bold mb-1"
            >
              Expense Tracker
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-base">
              Track your daily expenses
            </Text>
          </View>
          <TouchableOpacity
            onPress={toggleTheme}
            className="px-4 py-3 rounded-2xl border flex-row items-center"
            style={{
              backgroundColor: colors.toggleBg,
              borderColor: colors.toggleBorder,
            }}
          >
            {isDark ? (
              <Sun size={16} color={colors.toggleText} strokeWidth={2.5} />
            ) : (
              <Moon size={16} color={colors.toggleText} strokeWidth={2.5} />
            )}
            <Text
              style={{ color: colors.toggleText }}
              className="font-semibold ml-2"
            >
              {isDark ? 'Light' : 'Dark'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mx-6 mb-6">
          <LinearGradient
            colors={isDark ? ['#0f766e', '#1d4ed8'] : ['#10b981', '#0ea5e9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 20 }}
          >
            <View className="flex-row items-center mb-2">
              <TrendingUp size={20} color="#ffffff" strokeWidth={2.5} />
              <Text className="text-white/80 text-sm ml-2 font-medium">
                Total Expenses
              </Text>
            </View>
            <Text className="text-white text-4xl font-bold">
              ₹{getTotalExpenses().toFixed(2)}
            </Text>
            <Text className="text-white/80 text-sm mt-1">
              {expenses.length} transaction{expenses.length !== 1 ? 's' : ''}
            </Text>
          </LinearGradient>
        </View>

        {expenses.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: colors.emptyIconBg }}
            >
              <Wallet size={40} color={colors.muted} strokeWidth={2} />
            </View>
            <Text
              style={{ color: colors.textPrimary }}
              className="text-xl font-semibold mb-2"
            >
              No expenses yet
            </Text>
            <Text
              style={{ color: colors.textSecondary }}
              className="text-center text-base"
            >
              Start tracking your expenses by adding your first transaction
            </Text>
          </View>
        ) : (
          <View className="flex-1 px-6">
            <Text
              style={{ color: colors.textPrimary }}
              className="text-lg font-semibold mb-3"
            >
              Recent Transactions
            </Text>
            <FlatList
              data={expenses}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const chip = getCategoryChip(item.category);
                return (
                  <View
                    className="rounded-2xl p-4 mb-3 border"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.surfaceBorder,
                    }}
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 pr-2">
                        <Text
                          style={{ color: colors.textPrimary }}
                          className="text-lg font-semibold mb-1"
                        >
                          {item.title}
                        </Text>
                        <View className="flex-row items-center mb-2">
                          <View
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: chip.backgroundColor }}
                          >
                            <Text
                              style={{ color: chip.color }}
                              className="text-xs font-semibold"
                            >
                              {item.category}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center">
                          <Calendar
                            size={14}
                            color={colors.muted}
                            strokeWidth={2}
                          />
                          <Text
                            style={{ color: colors.textSecondary }}
                            className="text-sm ml-1"
                          >
                            {formatDate(item.date)}
                          </Text>
                        </View>
                      </View>

                      <View className="items-end">
                        <Text
                          style={{ color: colors.textPrimary }}
                          className="text-2xl font-bold mb-2"
                        >
                          ₹{item.amount.toFixed(2)}
                        </Text>
                        <View className="flex-row" style={{ gap: 8 }}>
                          <TouchableOpacity
                            onPress={() => handleEdit(item)}
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: colors.editBtnBg }}
                          >
                            <Pencil
                              size={18}
                              color={isDark ? '#93c5fd' : '#2563eb'}
                              strokeWidth={2.5}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => deleteExpense(item.id)}
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: colors.deleteBtnBg }}
                          >
                            <Trash2
                              size={18}
                              color={isDark ? '#fca5a5' : '#ef4444'}
                              strokeWidth={2.5}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }}
            />

            <Modal
              visible={editModalVisible}
              animationType="slide"
              transparent
              onRequestClose={() => setEditModalVisible(false)}
            >
              <View
                className="flex-1 justify-center items-center"
                style={{ backgroundColor: colors.modalOverlay }}
              >
                <View
                  className="rounded-3xl p-6 w-11/12 border"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.surfaceBorder,
                  }}
                >
                  <Text
                    style={{ color: colors.textPrimary }}
                    className="text-xl font-bold mb-4"
                  >
                    Edit Expense
                  </Text>

                  <Text
                    style={{ color: colors.textSecondary }}
                    className="font-semibold mb-2"
                  >
                    Title
                  </Text>
                  <TextInput
                    value={editTitle}
                    onChangeText={setEditTitle}
                    className="rounded-xl px-4 py-3 text-base border mb-4"
                    placeholder="Expense Title"
                    placeholderTextColor={colors.placeholder}
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.inputText,
                    }}
                  />

                  <Text
                    style={{ color: colors.textSecondary }}
                    className="font-semibold mb-2"
                  >
                    Amount
                  </Text>
                  <TextInput
                    value={editAmount}
                    onChangeText={setEditAmount}
                    className="rounded-xl px-4 py-3 text-base border mb-6"
                    placeholder="0.00"
                    placeholderTextColor={colors.placeholder}
                    keyboardType="decimal-pad"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.inputText,
                    }}
                  />

                  <View className="flex-row justify-end" style={{ gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setEditModalVisible(false)}
                      className="px-5 py-2 rounded-xl"
                      style={{
                        backgroundColor: isDark ? '#1f2937' : '#e2e8f0',
                      }}
                    >
                      <Text
                        style={{ color: colors.textSecondary }}
                        className="font-semibold"
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleEditSave}
                      className="px-5 py-2 rounded-xl"
                      style={{ backgroundColor: '#10b981' }}
                    >
                      <Text className="text-white font-semibold">Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}
