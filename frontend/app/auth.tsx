import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '@/components/FreshComponents';
import { clearAuthError, sendOtp } from '@/store/slices/userSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const { height } = Dimensions.get('window');
const IMAGE_SECTION_HEIGHT = height * 0.35;
const SAVED_PHONE_NUMBERS_KEY = 'savedPhoneNumbers';

function parseSavedPhoneNumbers(value: string | null) {
  if (!value) return [];

  try {
    const numbers: unknown = JSON.parse(value);
    return Array.isArray(numbers)
      ? numbers.filter((number): number is string => /^[6-9]\d{9}$/.test(number))
      : [];
  } catch {
    return [];
  }
}

export default function AuthScreen() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.user.isLoading);
  const error = useAppSelector((state) => state.user.error);
  const [phone, setPhoneInput] = useState('');
  const [touched, setTouched] = useState(false);
  const [savedPhoneNumbers, setSavedPhoneNumbers] = useState<string[]>([]);
  const [showSavedNumbers, setShowSavedNumbers] = useState(false);
  const phoneInputRef = useRef<TextInput>(null);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(SAVED_PHONE_NUMBERS_KEY)
      .then((value) => {
        const numbers = parseSavedPhoneNumbers(value);
        if (isMounted && numbers.length > 0) {
          setSavedPhoneNumbers(numbers);
          setShowSavedNumbers(true);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const isValid = /^[6-9]\d{9}$/.test(phone);
  const showError = touched && phone.length > 0 && !isValid;

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
    setPhoneInput(cleaned);
    dispatch(clearAuthError());
  };

  const savePhoneNumber = async (number: string) => {
    try {
      const storedNumbers = await AsyncStorage.getItem(SAVED_PHONE_NUMBERS_KEY);
      const numbers = [
        number,
        ...parseSavedPhoneNumbers(storedNumbers).filter((saved) => saved !== number),
      ].slice(0, 5);
      await AsyncStorage.setItem(SAVED_PHONE_NUMBERS_KEY, JSON.stringify(numbers));
      setSavedPhoneNumbers(numbers);
    } catch {
      // Saving a number should not block sign-in.
    }
  };

  const sendOtpForNumber = async (number: string) => {
    setPhoneInput(number);
    setShowSavedNumbers(false);
    dispatch(clearAuthError());

    try {
      await dispatch(sendOtp(number)).unwrap();
      await savePhoneNumber(number);
      router.push('/otp');
    } catch {
      // The rejected thunk stores the API message in Redux for display.
    }
  };

  const handleSavedNumberSelect = (number: string) => {
    setShowSavedNumbers(false);
    setPhoneInput(number);

    setTimeout(() => {
      void sendOtpForNumber(number);
    }, 0);
  };

  const handleSendOtp = () => {
    if (!isValid) {
      setTouched(true);
      return;
    }

    void sendOtpForNumber(phone);
  };

  return (
    <View className="flex-1 bg-white ">
      <View
        style={{ height: IMAGE_SECTION_HEIGHT }}
        className="items-center justify-center "
      >
        <Image
          source={require('@/assets/images/auth-hero.png')}
          className="h-full w-full"
          resizeMode="contain"
        />
      </View>

      <View className="flex-1 justify-between px-6 pb-8 ">
        <View>
          <Text className="text-[1.8rem] font-raleway-semibold text-[#111827]">
            Welcome to Dinesh Farms
          </Text>

          <View
            className={`mt-5 flex-row items-center gap-2 rounded-xl border px-[14px] ${showError ? 'border-red-500' : 'border-[#E2E8F0]'
              }`}
          >
            <Text className="text-[20px] font-semibold  text-[#111827]">
              +91
            </Text>

            <TextInput
              ref={phoneInputRef}
              className="flex-1 py-[16px] text-[20px] font-semibold  text-[#111827]"
              placeholder="Enter your mobile number"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={handleChange}
              onBlur={() => setTouched(true)}
              maxLength={10}
            />
          </View>

          {showError && (
            <Text className="mt-1.5 text-[13px] font-raleway-semibold text-red-500">
              Enter a valid 10-digit mobile number
            </Text>
          )}
          {error && (
            <Text className="mt-1.5 text-[13px] font-raleway-semibold text-red-500">
              {error}
            </Text>
          )}
        </View>

        <View>
          <Pressable
            onPress={handleSendOtp}
            disabled={!isValid || isLoading}
            className={`h-16 w-full items-center justify-center rounded-full ${isValid ? 'bg-[#023E8A]' : 'bg-[#93A9FF]'
              }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-[20px] font-raleway-semibold text-white">
                Send OTP
              </Text>
            )}
          </Pressable>

          <Text className="mt-4 text-center text-[12px] font-raleway-semibold leading-[18px] text-[#64748B]">
            By signing in, you are accepting our{' '}
            <Text
              className="font-raleway-semibold text-[#023E8A]"
              onPress={() => router.push('/terms')}
            >
              Terms & Conditions
            </Text>
            {' '}and{' '}
            <Text
              className="font-raleway-semibold text-[#023E8A]"
              onPress={() => router.push('/privacy-policy')}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>

      <Modal
        visible={showSavedNumbers}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSavedNumbers(false)}
      >
        <View className="flex-1 justify-center bg-black/40 px-6">
          <View className="rounded-2xl bg-white p-5">
            <Text className="text-[18px] font-raleway-bold text-[#111827]">
              Continue with a saved number
            </Text>
           

            <View className="mt-4 gap-2">
              {savedPhoneNumbers.map((savedNumber) => (
                <Pressable
                  key={savedNumber}
                  disabled={isLoading}
                  onPress={() => handleSavedNumberSelect(savedNumber)}
                  className="flex-row items-center justify-between rounded-xl border border-[#E2E8F0] px-4 py-3"
                >
                  <Text className="text-[16px] font-semibold text-[#111827]">
                    +91 {savedNumber}
                  </Text>
                  {isLoading ? (
                    <ActivityIndicator color="#023E8A" />
                  ) : (
                    <Text className="text-[14px] font-raleway-semibold text-[#023E8A]">
                      Continue
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>

            <Pressable
              className="mt-4 items-center py-2"
              onPress={() => {
                setShowSavedNumbers(false);
                phoneInputRef.current?.focus();
              }}
            >
              <Text className="text-[15px] font-raleway-semibold text-[#64748B]">
                Use a different number
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}