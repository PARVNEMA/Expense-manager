import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, LucideIndianRupee, Moon, Sun } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/context/ThemeContext';
import { useExpenses } from '@/context/ExpenseContext';

const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Health',
  'Other',
];

export default function AddExpense() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [otherCategory, setOtherCategory] = useState('');
  const [amount, setAmount] = useState('');
  const { addExpense } = useExpenses();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const isDark = theme === 'dark';
  const colors = useMemo(
    () =>
      isDark
        ? {
            background: '#0b1220',
            card: '#111827',
            cardBorder: '#1f2937',
            textPrimary: '#f9fafb',
            textSecondary: '#9ca3af',
            inputBg: '#0f172a',
            inputBorder: '#334155',
            inputText: '#f9fafb',
            placeholder: '#64748b',
            chipBg: '#172036',
            chipText: '#cbd5e1',
            toggleBg: '#172036',
            toggleBorder: '#334155',
            toggleText: '#e2e8f0',
            buttonText: '#ffffff',
          }
        : {
            background: '#f8fafc',
            card: '#ffffff',
            cardBorder: '#e2e8f0',
            textPrimary: '#0f172a',
            textSecondary: '#64748b',
            inputBg: '#f8fafc',
            inputBorder: '#cbd5e1',
            inputText: '#0f172a',
            placeholder: '#94a3b8',
            chipBg: '#f1f5f9',
            chipText: '#334155',
            toggleBg: '#ffffff',
            toggleBorder: '#cbd5e1',
            toggleText: '#0f172a',
            buttonText: '#ffffff',
          },
    [isDark],
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const getCategoryColor = (cat: string) => {
    const map: Record<string, { light: string; dark: string }> = {
      Food: { light: '#f97316', dark: '#fb923c' },
      Transport: { light: '#3b82f6', dark: '#60a5fa' },
      Shopping: { light: '#8b5cf6', dark: '#a78bfa' },
      Entertainment: { light: '#ec4899', dark: '#f472b6' },
      Bills: { light: '#ef4444', dark: '#f87171' },
      Health: { light: '#22c55e', dark: '#4ade80' },
      Other: { light: '#6b7280', dark: '#9ca3af' },
    };
    const resolved = map[cat] ?? map.Other;
    return isDark ? resolved.dark : resolved.light;
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an expense title');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (category === 'Other' && !otherCategory.trim()) {
      Alert.alert('Error', 'Please enter the other category');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    addExpense({
      title: title.trim(),
      category: category === 'Other' ? otherCategory.trim() : category,
      amount: parseFloat(amount),
    });

    setTitle('');
    setCategory('');
    setOtherCategory('');
    setAmount('');

    Alert.alert('Success', 'Expense added successfully!', [
      {
        text: 'OK',
        onPress: () => router.push('/(tabs)'),
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row justify-between items-center px-6 pt-2">
            <View>
              <Text
                style={{ color: colors.textPrimary }}
                className="text-3xl font-bold"
              >
                Add Expense
              </Text>
              <Text
                style={{ color: colors.textSecondary }}
                className="text-base mt-1"
              >
                Track spending with clean records
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

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="px-6 pt-6"
          >
            <LinearGradient
              colors={isDark ? ['#1d4ed8', '#0f766e'] : ['#059669', '#0ea5e9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 18, marginBottom: 16 }}
            >
              <Text className="text-white/80 text-sm">Quick Entry</Text>
              <Text className="text-white text-2xl font-bold mt-1">
                Keep your budget sharp
              </Text>
            </LinearGradient>

            <View
              className="rounded-3xl p-6 mb-4"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderWidth: 1,
              }}
            >
              <Text
                style={{ color: colors.textSecondary }}
                className="font-semibold text-base mb-3"
              >
                Expense Title
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Grocery shopping"
                placeholderTextColor={colors.placeholder}
                className="rounded-xl px-4 py-4 text-base border"
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.inputText,
                }}
              />
            </View>

            <View
              className="rounded-3xl p-6 mb-4"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderWidth: 1,
              }}
            >
              <Text
                style={{ color: colors.textSecondary }}
                className="font-semibold text-base mb-4"
              >
                Category
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className="px-5 py-3 rounded-xl border-2"
                    style={{
                      backgroundColor:
                        category === cat
                          ? getCategoryColor(cat)
                          : colors.chipBg,
                      borderColor:
                        category === cat
                          ? getCategoryColor(cat)
                          : colors.inputBorder,
                    }}
                  >
                    <View className="flex-row items-center">
                      <Text
                        style={{
                          color: category === cat ? '#ffffff' : colors.chipText,
                        }}
                        className="font-semibold text-base"
                      >
                        {cat}
                      </Text>
                      {category === cat && (
                        <Check
                          size={16}
                          color="#ffffff"
                          strokeWidth={3}
                          style={{ marginLeft: 6 }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {category === 'Other' && (
                <View className="mt-4">
                  <Text
                    style={{ color: colors.textSecondary }}
                    className="font-medium mb-2"
                  >
                    Other Category
                  </Text>
                  <TextInput
                    value={otherCategory}
                    onChangeText={setOtherCategory}
                    placeholder="Enter category"
                    placeholderTextColor={colors.placeholder}
                    className="rounded-xl px-4 py-3 text-base border"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.inputText,
                    }}
                  />
                </View>
              )}
            </View>

            <View
              className="rounded-3xl p-6 mb-6"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderWidth: 1,
              }}
            >
              <Text
                style={{ color: colors.textSecondary }}
                className="font-semibold text-base mb-3"
              >
                Amount
              </Text>
              <View
                className="flex-row items-center rounded-xl px-4 py-4 border"
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                }}
              >
                <LucideIndianRupee size={24} color={colors.inputText} />
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="decimal-pad"
                  className="flex-1 text-2xl font-semibold"
                  style={{ color: colors.inputText }}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              className="rounded-2xl overflow-hidden active:opacity-90"
            >
              <LinearGradient
                colors={
                  isDark ? ['#16a34a', '#0d9488'] : ['#22c55e', '#14b8a6']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 18, borderRadius: 16 }}
              >
                <Text
                  style={{ color: colors.buttonText }}
                  className="text-center text-lg font-bold tracking-wide"
                >
                  Add Expense
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
