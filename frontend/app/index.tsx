import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { fetchAddresses } from '@/store/slices/addressesSlice';
import { fetchProfile } from '@/store/slices/profileSlice';
import { restoreSession } from '@/store/slices/userSlice';
import { useAppDispatch } from '@/store/hooks';

export default function Index() {
  const dispatch = useAppDispatch();
  const [destination, setDestination] = useState<'/(tabs)' | '/onboarding' | null>(null);

  useEffect(() => {
    let isMounted = true;

    const restoreSavedSession = async () => {
      try {
        const [accessToken, refreshToken] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('refreshToken'),
        ]);

        if (!isMounted) return;

        if (accessToken) {
          dispatch(restoreSession({ accessToken, refreshToken }));
          dispatch(fetchProfile());
          dispatch(fetchAddresses());
          setDestination('/(tabs)');
        } else {
          setDestination('/onboarding');
        }
      } catch {
        if (isMounted) setDestination('/onboarding');
      }
    };

    void restoreSavedSession();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return destination ? <Redirect href={destination} /> : null;
}
