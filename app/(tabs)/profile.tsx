import { View, Text } from 'react-native';
import React from 'react';
import Header from '@/components/header';
import { useTheme } from '@/context/ThemeContext';

const Profile = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#0b1220' : '#f8fafc',
      }}
    >
      <Header title={'Profile'} />
      <Text style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>Profile</Text>
    </View>
  );
};

export default Profile;
