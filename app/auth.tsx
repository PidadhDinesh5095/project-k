import { useState } from 'react';
import { router } from 'expo-router';
import {
  Dimensions,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '@/components/FreshComponents';
import { setPhone } from '@/store/slices/userSlice';
import { useAppDispatch } from '@/store/hooks';

const { height } = Dimensions.get('window');
const IMAGE_SECTION_HEIGHT = height * 0.35;

export default function AuthScreen() {
  const dispatch = useAppDispatch();
  const [phone, setPhoneInput] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = /^[6-9]\d{9}$/.test(phone);
  const showError = touched && phone.length > 0 && !isValid;

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
    setPhoneInput(cleaned);
  };

  const handleSendOtp = () => {
    if (!isValid) {
      setTouched(true);
      return;
    }
    dispatch(setPhone(phone));
    router.push('/otp');
  };

  return (
    <View className="flex-1 bg-white">
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
          <Text className="text-[1.8rem] font-extrabold text-[#111827]">
            Welcome to Dinesh Farms
          </Text>

          <View
            className={`mt-5 flex-row items-center gap-2 rounded-xl border px-[14px] ${showError ? 'border-red-500' : 'border-[#E2E8F0]'
              }`}
          >
            <Text className="text-[18px] font-bold text-[#111827]">
              +91
            </Text>

            <TextInput
              className="flex-1 py-[16px] text-[18px] text-[#111827]"
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
            <Text className="mt-1.5 text-[13px] text-red-500">
              Enter a valid 10-digit mobile number
            </Text>
          )}
        </View>

        <View>
          <Pressable
            onPress={handleSendOtp}
            disabled={!isValid}
            className={`h-16 w-full items-center justify-center rounded-full ${isValid ? 'bg-[#1E4FFF]' : 'bg-[#93A9FF]'
              }`}
          >
            <Text className="text-[20px] font-bold text-white">
              Send OTP
            </Text>
          </Pressable>

          <Text className="mt-4 text-center text-[12px] leading-[18px] text-[#64748B]">
            By signing in, you are accepting our{' '}
            <Text
              className="font-semibold text-[#1E4FFF]"
              onPress={() => router.push('/terms')}
            >
              Terms & Conditions
            </Text>
            {' '}and{' '}
            <Text
              className="font-semibold text-[#1E4FFF]"
              onPress={() => router.push('/privacy-policy')}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}