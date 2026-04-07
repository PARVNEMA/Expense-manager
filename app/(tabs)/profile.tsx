import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import Header from '@/components/header';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const Profile = () => {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const isDark = theme === 'dark';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#0b1220' : '#f8fafc',
      }}
    >
      <Header title={'Profile'} />
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 20 }}>
          {user?.fullName ?? 'Profile'}
        </Text>
        <Text style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: 14 }}>
          {user?.email ?? 'No account email'}
        </Text>
        <TouchableOpacity
          onPress={signOut}
          style={{
            marginTop: 8,
            alignSelf: 'flex-start',
            backgroundColor: isDark ? '#dc2626' : '#ef4444',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;
