import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuthError, sendOtp, verifyOtp } from '@/store/slices/userSlice';
import { ArrowLeft } from 'lucide-react-native';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const dispatch = useAppDispatch();
  const phone = useAppSelector((state) => state.user.phone);
  const isLoading = useAppSelector((state) => state.user.isLoading);
  const error = useAppSelector((state) => state.user.error);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const verificationInProgress = useRef(false);

  const isComplete = digits.every((d) => d.length === 1);

  useEffect(() => {
    if (timer === 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const submitOtp = async (otp: string) => {
    if (otp.length !== OTP_LENGTH || verificationInProgress.current) return;
    verificationInProgress.current = true;

    try {
      const result = await dispatch(verifyOtp({ phone, otp })).unwrap();
      if (result.isNewUser) {
        router.replace('/address-setup');
      } else if (result.profileCompleted) {
        router.replace('/(tabs)');
      } else {
        router.replace('/complete-profile');
      }
    } catch {
      // The rejected thunk stores the API message in Redux for display.
    } finally {
      verificationInProgress.current = false;
    }
  };

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    dispatch(clearAuthError());

    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, OTP_LENGTH - index).split('');
      const next = [...digits];
      chars.forEach((character, characterIndex) => {
        next[index + characterIndex] = character;
      });
      setDigits(next);

      if (next.every((digit) => digit.length === 1)) {
        inputRefs.current[OTP_LENGTH - 1]?.blur();
        void submitOtp(next.join(''));
      } else {
        const nextEmptyIndex = next.findIndex((digit) => digit.length === 0);
        inputRefs.current[nextEmptyIndex]?.focus();
      }
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);

    if (cleaned && next.every((digit) => digit.length === 1)) {
      inputRefs.current[index]?.blur();
      void submitOtp(next.join(''));
    } else if (cleaned) {
      const nextEmptyIndex = next.findIndex((digit) => digit.length === 0);
      if (nextEmptyIndex >= 0) inputRefs.current[nextEmptyIndex]?.focus();
    }
  };

  const handleKeyPress = (
    e: { nativeEvent: { key: string } },
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
    }
  };

  const handleVerify = () => {
    if (isComplete) void submitOtp(digits.join(''));
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await dispatch(sendOtp(phone)).unwrap();
      setTimer(RESEND_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch {
      // The rejected thunk stores the API message in Redux for display.
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1">
        <Pressable className="ml-4 mt-2" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={28} color="#111827" />
        </Pressable>

        <View className="mt-5 flex-1 justify-between px-6 pb-8">
          <View>
            <Text className="text-[1.8rem] font-raleway-semibold text-[#111827]">
              Enter OTP
            </Text>

            <Text className="mt-1.5 text-[1.1rem] font-raleway-semibold text-[#64748B]">
              Sent to +91 {phone}
            </Text>

            <View className="mt-7 flex-row gap-3">
              {digits.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  autoFocus={i === 0}
                  showSoftInputOnFocus
                  className={`aspect-square flex-1 rounded-xl border-2 font-raleway text-center text-[22px] font-bold text-[#111827] ${
                    focusedIndex === i
                      ? 'border-[#023E8A]'
                      : digit
                        ? 'border-[#023E8A]'
                        : 'border-[#E2E8F0]'
                  }`}
                  underlineColorAndroid="transparent"
                  style={{ textAlignVertical: 'center' }}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  value={digit}
                  onChangeText={(text) => handleChange(text, i)}
                  onKeyPress={(e) => handleKeyPress(e, i)}
                  onFocus={() => setFocusedIndex(i)}
                  onBlur={() => setFocusedIndex(null)}
                  textContentType="oneTimeCode"
                  autoComplete={i === 0 ? 'sms-otp' : 'off'}
                  importantForAutofill={i === 0 ? 'yes' : 'no'}
                />
              ))}
            </View>

            {error && (
              <Text className="mt-4 text-center text-[13px] font-raleway-semibold text-red-500">
                {error}
              </Text>
            )}

            <Pressable onPress={handleResend} disabled={timer > 0 || isLoading}>
              <Text className="mt-4 text-center underline text-[16px] font-raleway-semibold text-[#64748B]">
                {timer > 0
                  ? `Resend OTP in 0:${timer.toString().padStart(2, '0')}`
                  : 'Resend OTP'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleVerify}
            disabled={!isComplete || isLoading}
            className={`h-16 w-full items-center justify-center rounded-full ${
              isComplete ? 'bg-[#023E8A]' : 'bg-[#93A9FF]'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-[20px] font-raleway-semibold text-white">
                Verify & Continue
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}