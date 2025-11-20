import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ZaloService } from './src/services/zalo';
import ZALO_CONFIG from './src/config/zalo.config';

export default function App() {
  useEffect(() => {
    // Khởi tạo Zalo SDK khi app start
    const initializeZalo = async () => {
      try {
        await ZaloService.initialize(ZALO_CONFIG.APP_ID);
        console.log('Zalo SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Zalo SDK:', error);
      }
    };

    initializeZalo();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
