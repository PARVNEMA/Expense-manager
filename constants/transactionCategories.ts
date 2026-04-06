import type { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { TransactionType } from '@/context/ExpenseContext';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface CategoryMeta {
  icon: IconName;
  light: string;
  dark: string;
}

export const PRESET_CATEGORIES: Record<TransactionType, string[]> = {
  income: ['Salary', 'Freelance', 'Investments', 'Gift'],
  expense: [
    'Food',
    'Transport',
    'Shopping',
    'Entertainment',
    'Bills',
    'Health',
    'Housing',
  ],
};

const fallbackCategory: CategoryMeta = {
  icon: 'shape-outline',
  light: '#64748b',
  dark: '#94a3b8',
};

const categoryMap: Record<string, CategoryMeta> = {
  Salary: { icon: 'cash-multiple', light: '#059669', dark: '#34d399' },
  Freelance: { icon: 'laptop', light: '#0284c7', dark: '#38bdf8' },
  Investments: { icon: 'chart-line', light: '#7c3aed', dark: '#a78bfa' },
  Gift: { icon: 'gift-outline', light: '#db2777', dark: '#f472b6' },
  Food: { icon: 'silverware-fork-knife', light: '#ea580c', dark: '#fb923c' },
  Transport: { icon: 'car-outline', light: '#2563eb', dark: '#60a5fa' },
  Shopping: { icon: 'shopping-outline', light: '#9333ea', dark: '#c084fc' },
  Entertainment: { icon: 'movie-open-outline', light: '#be185d', dark: '#f472b6' },
  Bills: { icon: 'receipt-text-outline', light: '#dc2626', dark: '#f87171' },
  Health: { icon: 'heart-pulse', light: '#16a34a', dark: '#4ade80' },
  Housing: { icon: 'home-outline', light: '#4f46e5', dark: '#818cf8' },
};

export const getCategoryMeta = (category: string): CategoryMeta =>
  categoryMap[category] ?? fallbackCategory;
