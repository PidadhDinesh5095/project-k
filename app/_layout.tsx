import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Provider } from 'react-redux';
import { store } from '@/store';
import '../global.css';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <Provider store={store}>
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
          translucent={false}
        />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaView>
    </Provider>
  );
}
