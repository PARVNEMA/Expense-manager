import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTheme } from '@/context/ThemeContext';
import { useExpenses, TransactionType } from '@/context/ExpenseContext';
import {
  PRESET_CATEGORIES,
  getCategoryMeta,
} from '@/constants/transactionCategories';
import Header from '@/components/header';

const CUSTOM_CATEGORY = 'Custom';

const getToday = () => new Date().toISOString().slice(0, 10);
const parseDate = (value: string) => new Date(`${value}T00:00:00`);
const formatDate = (value: string) =>
  parseDate(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const validateDateString = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

export default function AddTransaction() {
  const { theme } = useTheme();
  const { addTransaction, isLoaded } = useExpenses();
  const router = useRouter();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getToday());
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isDark = theme === 'dark';
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(22)).current;

  const palette = useMemo(
    () =>
      isDark
        ? {
            background: '#0a0d14',
            card: '#111827',
            border: '#1f2937',
            text: '#f8fafc',
            muted: '#94a3b8',
            inputBg: '#0f172a',
            inputBorder: '#334155',
            placeholder: '#64748b',
          }
        : {
            background: '#f8fafc',
            card: '#ffffff',
            border: '#e2e8f0',
            text: '#0f172a',
            muted: '#64748b',
            inputBg: '#f8fafc',
            inputBorder: '#cbd5e1',
            placeholder: '#94a3b8',
          },
    [isDark],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide]);

  useEffect(() => {
    setCategory('');
    setCustomCategory('');
  }, [type]);

  const categories = [...PRESET_CATEGORIES[type], CUSTOM_CATEGORY];

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type !== 'set' || !selectedDate) return;
    setDate(selectedDate.toISOString().slice(0, 10));
  };

  const submit = async () => {
    const parsedAmount = Number(amount);
    const selectedCategory =
      category === CUSTOM_CATEGORY ? customCategory.trim() : category.trim();

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter an amount greater than 0.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert(
        'Missing category',
        'Select a category or enter a custom one.',
      );
      return;
    }
    if (!validateDateString(date)) {
      Alert.alert('Invalid date', 'Use date format YYYY-MM-DD.');
      return;
    }
    if (!note.trim()) {
      Alert.alert('Missing note', 'Add a short note for this transaction.');
      return;
    }

    try {
      setSubmitting(true);
      await addTransaction({
        type,
        amount: parsedAmount,
        category: selectedCategory,
        date,
        note: note.trim(),
      });

      setAmount('');
      setNote('');
      setCategory('');
      setCustomCategory('');
      setDate(getToday());
      router.push('/(tabs)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={isDark ? ['#1d4ed8', '#0f766e'] : ['#2563eb', '#14b8a6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              marginHorizontal: 20,
              marginTop: 16,
              borderRadius: 20,
              padding: 18,
            }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
              New Transaction
            </Text>
            <Text
              style={{
                color: '#fff',
                fontSize: 28,
                fontWeight: '800',
                marginTop: 2,
              }}
            >
              Fast capture
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
              Save income and expenses with monthly-ready records.
            </Text>
          </LinearGradient>

          <Animated.View
            style={{
              opacity: fade,
              transform: [{ translateY: slide }],
              marginHorizontal: 20,
              marginTop: 14,
              gap: 12,
            }}
          >
            <View
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
                borderWidth: 1,
                borderRadius: 20,
                padding: 16,
              }}
            >
              <Text
                style={{
                  color: palette.muted,
                  marginBottom: 10,
                  fontWeight: '600',
                }}
              >
                Type
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['expense', 'income'] as TransactionType[]).map((item) => {
                  const selected = item === type;
                  return (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setType(item)}
                      style={{
                        flex: 1,
                        backgroundColor: selected
                          ? item === 'income'
                            ? '#059669'
                            : '#dc2626'
                          : palette.inputBg,
                        borderColor: selected
                          ? 'transparent'
                          : palette.inputBorder,
                        borderWidth: 1,
                        borderRadius: 12,
                        paddingVertical: 10,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: selected ? '#fff' : palette.text,
                          fontWeight: '700',
                        }}
                      >
                        {item === 'income' ? 'Income' : 'Expense'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
                borderWidth: 1,
                borderRadius: 20,
                padding: 16,
              }}
            >
              <Text
                style={{
                  color: palette.muted,
                  marginBottom: 10,
                  fontWeight: '600',
                }}
              >
                Amount
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor={palette.placeholder}
                style={{
                  backgroundColor: palette.inputBg,
                  borderColor: palette.inputBorder,
                  borderWidth: 1,
                  borderRadius: 12,
                  color: palette.text,
                  fontSize: 24,
                  fontWeight: '700',
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                }}
              />
            </View>

            <View
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
                borderWidth: 1,
                borderRadius: 20,
                padding: 16,
              }}
            >
              <Text
                style={{
                  color: palette.muted,
                  marginBottom: 10,
                  fontWeight: '600',
                }}
              >
                Category
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {categories.map((item) => {
                  const selected = category === item;
                  const meta = getCategoryMeta(item);
                  const chipColor = isDark ? meta.dark : meta.light;
                  return (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setCategory(item)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        borderColor: selected ? chipColor : palette.inputBorder,
                        borderWidth: 1,
                        backgroundColor: selected
                          ? `${chipColor}22`
                          : palette.inputBg,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={meta.icon}
                        size={16}
                        color={selected ? chipColor : palette.muted}
                      />
                      <Text
                        style={{
                          color: selected ? chipColor : palette.text,
                          fontWeight: '600',
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {category === CUSTOM_CATEGORY ? (
                <TextInput
                  value={customCategory}
                  onChangeText={setCustomCategory}
                  placeholder="Enter custom category"
                  placeholderTextColor={palette.placeholder}
                  style={{
                    marginTop: 12,
                    backgroundColor: palette.inputBg,
                    borderColor: palette.inputBorder,
                    borderWidth: 1,
                    borderRadius: 12,
                    color: palette.text,
                    paddingHorizontal: 14,
                    paddingVertical: 11,
                  }}
                />
              ) : null}
            </View>

            <View
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
                borderWidth: 1,
                borderRadius: 20,
                padding: 16,
                gap: 10,
              }}
            >
              <Text style={{ color: palette.muted, fontWeight: '600' }}>
                Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  backgroundColor: palette.inputBg,
                  borderColor: palette.inputBorder,
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                }}
              >
                <Text style={{ color: palette.text, fontWeight: '600' }}>
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>

              {showDatePicker ? (
                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: 12,
                    borderColor: palette.inputBorder,
                    overflow: 'hidden',
                  }}
                >
                  <DateTimePicker
                    value={parseDate(date)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                  {Platform.OS === 'ios' ? (
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={{
                        alignSelf: 'flex-end',
                        margin: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 10,
                        backgroundColor: palette.inputBg,
                        borderWidth: 1,
                        borderColor: palette.inputBorder,
                      }}
                    >
                      <Text style={{ color: palette.text, fontWeight: '700' }}>
                        Done
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}
            </View>

            <View
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
                borderWidth: 1,
                borderRadius: 20,
                padding: 16,
              }}
            >
              <Text
                style={{
                  color: palette.muted,
                  marginBottom: 10,
                  fontWeight: '600',
                }}
              >
                Note
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="e.g. dinner with client"
                placeholderTextColor={palette.placeholder}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: palette.inputBg,
                  borderColor: palette.inputBorder,
                  borderWidth: 1,
                  borderRadius: 12,
                  color: palette.text,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  minHeight: 88,
                  textAlignVertical: 'top',
                }}
              />
            </View>

            <TouchableOpacity
              onPress={submit}
              disabled={!isLoaded || submitting}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                opacity: !isLoaded || submitting ? 0.65 : 1,
              }}
            >
              <LinearGradient
                colors={
                  type === 'income'
                    ? ['#059669', '#0d9488']
                    : ['#dc2626', '#f97316']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 16 }}
              >
                <Text
                  style={{
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 17,
                    fontWeight: '800',
                  }}
                >
                  {submitting ? 'Saving...' : 'Add Transaction'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
