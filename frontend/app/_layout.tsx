import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded] = useFonts({
    Raleway: require('../assets/fonts/static/Raleway-Regular.ttf'),
    RalewayLight: require('../assets/fonts/static/Raleway-Light.ttf'),
    RalewayMedium: require('../assets/fonts/static/Raleway-Medium.ttf'),
    RalewaySemiBold: require('../assets/fonts/static/Raleway-SemiBold.ttf'),
    RalewayBold: require('../assets/fonts/static/Raleway-Bold.ttf'),
    RalewayExtraBold: require('../assets/fonts/static/Raleway-ExtraBold.ttf'),
    RalewayBlack: require('../assets/fonts/static/Raleway-Black.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <SafeAreaView
        className="flex-1 bg-white"
        edges={['top']}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
          translucent={true}
        />

        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaView>
    </Provider>
  );
}