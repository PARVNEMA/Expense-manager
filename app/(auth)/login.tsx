import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const { theme, toggleTheme } = useTheme();
  const { signIn, signUp } = useAuth();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const palette = useMemo(
    () =>
      isDark
        ? {
            pageBg: '#0a0d14',
            card: '#121722',
            border: '#1f2937',
            text: '#f8fafc',
            muted: '#94a3b8',
            inputBg: '#0b1220',
            inputBorder: '#233047',
            button: '#e2e8f0',
            buttonText: '#111827',
            logoBg: '#f8fafc',
            logoText: '#111827',
          }
        : {
            pageBg: '#f1f5f9',
            card: '#ffffff',
            border: '#e2e8f0',
            text: '#0f172a',
            muted: '#64748b',
            inputBg: '#f8fafc',
            inputBorder: '#cbd5e1',
            button: '#0f172a',
            buttonText: '#f8fafc',
            logoBg: '#0f172a',
            logoText: '#f8fafc',
          },
    [isDark],
  );

  const isSignUp = mode === 'signup';

  const submit = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    if (isSignUp && !trimmedName) {
      Alert.alert('Missing name', 'Please enter your full name.');
      return;
    }
    if (isSignUp && trimmedPassword !== trimmedConfirmPassword) {
      Alert.alert('Password mismatch', 'Confirm password must match.');
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await signUp(trimmedName, trimmedEmail, trimmedPassword);
      } else {
        await signIn(trimmedEmail, trimmedPassword);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to authenticate.';
      Alert.alert('Authentication failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.pageBg }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingVertical: 30,
          }}
        >
          <View className="items-end my-2.5">
            <TouchableOpacity
              onPress={toggleTheme}
              className="w-[34px] h-[34px] rounded-full border items-center justify-center"
              style={{
                borderColor: palette.inputBorder,
                backgroundColor: palette.card,
              }}
            >
              {isDark ? (
                <Sun size={16} color={palette.text} />
              ) : (
                <Moon size={16} color={palette.text} />
              )}
            </TouchableOpacity>
          </View>

          <View className="items-center mb-4.5">
            <View
              className="w-[76px] h-[76px] rounded-[22px] items-center justify-center mb-3.5"
              style={{ backgroundColor: palette.logoBg }}
            >
              <Text
                className="text-[30px] font-extrabold"
                style={{ color: palette.logoText }}
              >
                P
              </Text>
            </View>

            <Text
              className="text-[30px] font-extrabold"
              style={{ color: palette.text }}
            >
              PayU
            </Text>

            <Text
              className="text-[16px] mt-1 text-center"
              style={{ color: palette.muted }}
            >
              Manage your Income and Expenses Easily
            </Text>
          </View>

          <View
            className="rounded-3xl p-5 gap-3.5 border"
            style={{
              backgroundColor: palette.card,
              borderColor: palette.border,
            }}
          >
            <Text
              className="text-[32px] font-extrabold"
              style={{ color: palette.text }}
            >
              Welcome
            </Text>

            <Text
              className="text-[16px] -mt-1"
              style={{ color: palette.muted }}
            >
              Sign in to continue or create a new account.
            </Text>

            <View
              className="self-start flex-row rounded-full border p-[3px] gap-1"
              style={{
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
              }}
            >
              <TouchableOpacity
                onPress={() => setMode('signin')}
                className="py-[7px] px-[14px] rounded-full"
                style={{
                  backgroundColor:
                    mode === 'signin' ? palette.button : 'transparent',
                }}
              >
                <Text
                  className="font-bold text-[13px]"
                  style={{
                    color:
                      mode === 'signin' ? palette.buttonText : palette.muted,
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMode('signup')}
                className="py-[7px] px-[14px] rounded-full"
                style={{
                  backgroundColor:
                    mode === 'signup' ? palette.button : 'transparent',
                }}
              >
                <Text
                  className="font-bold text-[13px]"
                  style={{
                    color:
                      mode === 'signup' ? palette.buttonText : palette.muted,
                  }}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {isSignUp && (
              <>
                <Text className="font-bold" style={{ color: palette.text }}>
                  Full Name
                </Text>

                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor={palette.muted}
                  className="rounded-xl px-3.5 py-3 border"
                  style={{
                    backgroundColor: palette.inputBg,
                    borderColor: palette.inputBorder,
                    color: palette.text,
                  }}
                />
              </>
            )}

            <Text className="font-bold" style={{ color: palette.text }}>
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
              className="rounded-xl px-3.5 py-3 border"
              style={{
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
                color: palette.text,
              }}
            />

            <Text className="font-bold" style={{ color: palette.text }}>
              Password
            </Text>

            <View
              className="flex-row items-center rounded-xl px-3.5 border"
              style={{
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
              }}
            >
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder={
                  isSignUp ? 'Create a password' : 'Enter your password'
                }
                placeholderTextColor={palette.muted}
                className="flex-1 py-3"
                style={{ color: palette.text }}
              />

              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff size={18} color={palette.muted} />
                ) : (
                  <Eye size={18} color={palette.muted} />
                )}
              </TouchableOpacity>
            </View>

            {isSignUp && (
              <>
                <Text className="font-bold" style={{ color: palette.text }}>
                  Confirm Password
                </Text>

                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor={palette.muted}
                  className="rounded-xl px-3.5 py-3 border"
                  style={{
                    backgroundColor: palette.inputBg,
                    borderColor: palette.inputBorder,
                    color: palette.text,
                  }}
                />
              </>
            )}

            <TouchableOpacity
              onPress={submit}
              disabled={loading}
              className="mt-2 rounded-xl items-center justify-center py-3"
              style={{
                backgroundColor: palette.button,
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text
                className="font-extrabold text-[18px]"
                style={{ color: palette.buttonText }}
              >
                {loading
                  ? 'Please wait...'
                  : isSignUp
                    ? 'Create Account'
                    : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;
