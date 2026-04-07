import { View, Text, TouchableOpacity } from 'react-native';
import React, { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  description?: string;
}

const Header = ({
  title: _title,
  description: _description = '',
}: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
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
            toggleBg: '#0f172a',
            toggleBorder: '#1f2937',
            toggleText: '#f8fafc',
            brandTileBg: '#e5e7eb',
            brandTileText: '#111827',
            brandText: '#f8fafc',
            headerBorder: '#1f2937',
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
            toggleBg: '#f8fafc',
            toggleBorder: '#cbd5e1',
            toggleText: '#0f172a',
            brandTileBg: '#111827',
            brandTileText: '#f8fafc',
            brandText: '#0f172a',
            headerBorder: '#e2e8f0',
          },
    [isDark],
  );

  return (
    <View
      className="px-6 pt-3 pb-4 flex-row justify-between items-center border-b"
      style={{ borderColor: colors.headerBorder }}
    >
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: colors.brandTileBg }}
        >
          <Text
            className="text-2xl font-black"
            style={{ color: colors.brandTileText }}
          >
            P
          </Text>
        </View>
        <Text
          className="text-3xl font-bold ml-3"
          style={{ color: colors.brandText }}
        >
          PayU
        </Text>
      </View>
      <TouchableOpacity
        onPress={toggleTheme}
        className="w-10 h-10 rounded-full border items-center justify-center"
        style={{
          backgroundColor: colors.toggleBg,
          borderColor: colors.toggleBorder,
        }}
      >
        {isDark ? (
          <Sun size={18} color={colors.toggleText} strokeWidth={2.5} />
        ) : (
          <Moon size={18} color={colors.toggleText} strokeWidth={2.5} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Header;
