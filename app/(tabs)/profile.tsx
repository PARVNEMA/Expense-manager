import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Eye, EyeOff, Pencil } from 'lucide-react-native';
import Header from '@/components/header';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const Profile = () => {
  const { theme } = useTheme();
  const { user, updateProfile, signOut } = useAuth();
  const isDark = theme === 'dark';

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName ?? '');
    setEmail(user?.email ?? '');
  }, [user]);

  const palette = useMemo(
    () =>
      isDark
        ? {
            background: '#0b1220',
            card: '#111827',
            border: '#1f2937',
            text: '#f8fafc',
            muted: '#94a3b8',
            inputBg: '#0f172a',
            inputBorder: '#334155',
            button: '#e2e8f0',
            buttonText: '#111827',
            danger: '#dc2626',
          }
        : {
            background: '#f8fafc',
            card: '#ffffff',
            border: '#e2e8f0',
            text: '#0f172a',
            muted: '#64748b',
            inputBg: '#f8fafc',
            inputBorder: '#cbd5e1',
            button: '#0f172a',
            buttonText: '#f8fafc',
            danger: '#ef4444',
          },
    [isDark],
  );

  const onToggleEdit = () => {
    if (isEditing) {
      setFullName(user?.fullName ?? '');
      setEmail(user?.email ?? '');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setIsEditing(false);
      return;
    }
    setIsEditing(true);
  };

  const onSave = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedName || !trimmedEmail) {
      Alert.alert('Missing fields', 'Please enter full name and email.');
      return;
    }

    if ((trimmedPassword || trimmedConfirm) && trimmedPassword !== trimmedConfirm) {
      Alert.alert('Password mismatch', 'Confirm password must match.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        fullName: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword || undefined,
      });
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setIsEditing(false);
      Alert.alert('Updated', 'Profile details updated successfully.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to update profile.';
      Alert.alert('Update failed', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <Header />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: palette.card,
            borderColor: palette.border,
            borderWidth: 1,
            borderRadius: 20,
            padding: 16,
            gap: 14,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? '#e5e7eb' : '#111827',
                }}
              >
                <Text
                  style={{
                    color: isDark ? '#111827' : '#f8fafc',
                    fontWeight: '800',
                    fontSize: 26,
                  }}
                >
                  P
                </Text>
              </View>
              <View>
                <Text style={{ color: palette.text, fontSize: 23, fontWeight: '800' }}>
                  {user?.fullName ?? 'Profile'}
                </Text>
                <Text style={{ color: palette.muted, marginTop: 2 }}>{user?.email ?? ''}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onToggleEdit}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: palette.inputBorder,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: palette.inputBg,
              }}
            >
              <Pencil size={17} color={palette.text} />
            </TouchableOpacity>
          </View>

          <Text style={{ color: palette.muted, fontSize: 13 }}>
            {isEditing
              ? 'Edit mode is enabled. Update and save your details.'
              : 'Tap the pencil icon to edit your profile.'}
          </Text>
        </View>

        {isEditing ? (
          <View
            style={{
              backgroundColor: palette.card,
              borderColor: palette.border,
              borderWidth: 1,
              borderRadius: 20,
              padding: 16,
              gap: 12,
            }}
          >
            <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16 }}>
              Full Name
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={palette.muted}
              style={{
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
                borderWidth: 1,
                borderRadius: 12,
                color: palette.text,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            />

            <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16 }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="Enter your email"
              placeholderTextColor={palette.muted}
              style={{
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
                borderWidth: 1,
                borderRadius: 12,
                color: palette.text,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            />

            <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16 }}>
              New Password
            </Text>
            <View
              style={{
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 14,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Leave empty to keep current password"
                placeholderTextColor={palette.muted}
                style={{ flex: 1, color: palette.text, paddingVertical: 12 }}
              />
              <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                {showPassword ? (
                  <EyeOff size={18} color={palette.muted} />
                ) : (
                  <Eye size={18} color={palette.muted} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16 }}>
              Confirm Password
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              placeholder="Confirm new password"
              placeholderTextColor={palette.muted}
              style={{
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
                borderWidth: 1,
                borderRadius: 12,
                color: palette.text,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            />

            <TouchableOpacity
              onPress={onSave}
              disabled={saving}
              style={{
                marginTop: 8,
                backgroundColor: palette.button,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 13,
                opacity: saving ? 0.65 : 1,
              }}
            >
              <Text style={{ color: palette.buttonText, fontWeight: '800', fontSize: 17 }}>
                {saving ? 'Updating...' : 'Update Details'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
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
            <Text style={{ color: palette.muted, fontSize: 13 }}>Full Name</Text>
            <Text style={{ color: palette.text, fontSize: 20, fontWeight: '700' }}>
              {user?.fullName ?? '-'}
            </Text>
            <Text style={{ color: palette.muted, fontSize: 13, marginTop: 6 }}>Email</Text>
            <Text style={{ color: palette.text, fontSize: 17 }}>{user?.email ?? '-'}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={signOut}
          style={{
            marginTop: 4,
            alignSelf: 'flex-start',
            backgroundColor: palette.danger,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Profile;
