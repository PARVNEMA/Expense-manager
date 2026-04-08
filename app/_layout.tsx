import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import '../global.css';
import { useState } from 'react';
import * as Updates from 'expo-updates';
import UpdateModal from '@/components/updateModal';
function RootNavigator() {
  const { isAuthenticated, isLoaded } = useAuth();

  if (!isLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isDownloadingUpdate, setIsDownloadingUpdate] = useState(false);

  const handleDownloadUpdate = async () => {
    setIsDownloadingUpdate(true);
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.error(`Error downloading or reloading update: ${error}`);
      setIsDownloadingUpdate(false);
      setIsUpdateModalVisible(false);
    }
  };

  const handleCancelUpdate = () => {
    setIsUpdateModalVisible(false);
  };
  return (
    <ThemeProvider>
      <AuthProvider>
        <ExpenseProvider>
          <RootNavigator />
          <StatusBar style="dark" />
          <UpdateModal
            visible={isUpdateModalVisible}
            onDownload={handleDownloadUpdate}
            onCancel={handleCancelUpdate}
            isDownloading={isDownloadingUpdate}
          />
        </ExpenseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
