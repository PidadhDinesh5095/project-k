import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppSelector } from '@/store/hooks';
import { ArrowLeft } from 'lucide-react-native';

const OTP_LENGTH = 4;
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const phone = useAppSelector((state) => state.user.phone);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const isComplete = digits.every((d) => d.length === 1);

  useEffect(() => {
    if (timer === 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');

    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, OTP_LENGTH).split('');
      const next = Array(OTP_LENGTH).fill('');
      chars.forEach((c, i) => (next[i] = c));
      setDigits(next);
      const lastFilled = Math.min(chars.length, OTP_LENGTH) - 1;
      inputRefs.current[lastFilled]?.focus();
      if (chars.length >= OTP_LENGTH) {
        inputRefs.current[OTP_LENGTH - 1]?.blur();
      }
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
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
    if (!isComplete) return;
    router.push('/address-setup');
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(RESEND_SECONDS);
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
            <Text className="text-[1.8rem] font-extrabold text-[#111827]">
              Enter OTP
            </Text>

            <Text className="mt-1.5 text-[1.1rem] text-[#64748B]">
              Sent to +91 {phone}
            </Text>

            <View className="mt-7 flex-row gap-3">
              {digits.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  className={`aspect-square flex-1 rounded-xl border-2 text-center text-[22px] font-extrabold text-[#111827] ${
                    focusedIndex === i
                      ? 'border-[#1E4FFF]'
                      : digit
                        ? 'border-[#1E4FFF]'
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

            <Pressable onPress={handleResend} disabled={timer > 0}>
              <Text className="mt-4 text-center underline text-[16px] text-[#64748B]">
                {timer > 0
                  ? `Resend OTP in 0:${timer.toString().padStart(2, '0')}`
                  : 'Resend OTP'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleVerify}
            disabled={!isComplete}
            className={`h-16 w-full items-center justify-center rounded-full ${
              isComplete ? 'bg-[#1E4FFF]' : 'bg-[#93A9FF]'
            }`}
          >
            <Text className="text-[20px] font-bold text-white">
              Verify & Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}