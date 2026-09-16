import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Calendar, CheckCircle2, Phone } from 'lucide-react-native';
import { colors, PrimaryButton } from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';

function isValidBirthDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day) &&
    date <= today
  );
}

function isAtLeast15(value: string) {
  const [, day, month, year] = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value) ?? [];
  if (!day || !month || !year) return false;

  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const today = new Date();
  const minimumBirthDate = new Date(
    today.getFullYear() - 15,
    today.getMonth(),
    today.getDate(),
  );
  return date <= minimumBirthDate;
}

export default function CompleteProfileScreen() {
  const { user, updateProfile } = useFreshStore();
  const [firstName, setFirstName] = useState(user.firstName ?? '');
  const [lastName, setLastName] = useState(user.lastName ?? '');
  const [email, setEmail] = useState(user.email ?? '');
  const [birthDate, setBirthDate] = useState(user.birthDate ?? '');
  const [touched, setTouched] = useState(false);

  const emailIsValid = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const birthDateIsValid = !birthDate.trim() || (isValidBirthDate(birthDate) && isAtLeast15(birthDate));
  const formIsValid = firstName.trim().length > 0 && birthDateIsValid && emailIsValid;
  const showFirstNameError = touched && !firstName.trim();
  const showBirthDateError = touched && !birthDateIsValid;
  const showEmailError = touched && !emailIsValid;

  const handleBirthDateChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '').slice(0, 8);
    const formatted = digits.length > 4
      ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
      : digits.length > 2
        ? `${digits.slice(0, 2)}/${digits.slice(2)}`
        : digits;
    setBirthDate(formatted);
  };

  const handleSubmit = () => {
    if (!formIsValid) {
      setTouched(true);
      return;
    }

    updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      email: email.trim() || undefined,
      birthDate,
    });
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-[#F7F9FC]">
      <Pressable className="ml-4 mt-2" onPress={() => router.back()} hitSlop={12}>
        <ArrowLeft size={28} color="#111827" />
      </Pressable>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
        <Text className="mt-2 text-[22px] font-extrabold text-[#111827]">Complete your profile</Text>
        

        <Text className="mb-2 mt-6 text-[15px] font-extrabold text-[#111827]">
          First name <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className={`rounded-xl border px-[14px] py-[14px] text-[15px] text-[#111827] ${showFirstNameError ? 'border-red-500' : 'border-[#E2E8F0]'}`}
          placeholder="Enter your first name"
          placeholderTextColor={colors.muted}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />
        {showFirstNameError && <Text className="mt-1.5 text-[13px] text-red-500">First name is required</Text>}

        <Text className="mb-2 mt-5 text-[15px] font-extrabold text-[#111827]">Last name</Text>
        <TextInput className="rounded-xl border border-[#E2E8F0] px-[14px] py-[14px] text-[15px] text-[#111827]" placeholder="Enter your last name" placeholderTextColor={colors.muted} value={lastName} onChangeText={setLastName} autoCapitalize="words" />

        <Text className="mb-2 mt-5 text-[15px] font-extrabold text-[#111827]">Email</Text>
        <TextInput
          className={`rounded-xl border px-[14px] py-[14px] text-[15px] text-[#111827] ${showEmailError ? 'border-red-500' : 'border-[#E2E8F0]'}`}
          placeholder="you@example.com"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {showEmailError && <Text className="mt-1.5 text-[13px] text-red-500">Enter a valid email address</Text>}

        <Text className="mb-2 mt-5 text-[15px] font-extrabold text-[#111827]">Mobile number</Text>
        <View className="flex-row items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#EEF3FF] px-[14px] py-[14px]">
          <Phone size={17} color={colors.primary} />
          <Text className="flex-1 text-[15px] font-semibold text-[#64748B]">{user.phone}</Text>
          <CheckCircle2 size={17} color={colors.green} />
        </View>

        <Text className="mb-2 mt-5 text-[15px] font-extrabold text-[#111827]">
          Birthday <Text className="font-normal text-[#64748B]">(optional)</Text>
        </Text>
        <View className={`flex-row items-center gap-2 rounded-xl border bg-white px-[14px] ${showBirthDateError ? 'border-red-500' : 'border-[#E2E8F0]'}`}>
          <Calendar size={17} color={colors.primary} />
          <TextInput className="flex-1 py-[14px] text-[15px] text-[#111827]" placeholder="DD/MM/YYYY" placeholderTextColor={colors.muted} value={birthDate} onChangeText={handleBirthDateChange} keyboardType="number-pad" maxLength={10} />
        </View>
        {showBirthDateError && (
          <Text className="mt-1.5 text-[13px] text-red-500">
            {isValidBirthDate(birthDate) && !isAtLeast15(birthDate)
              ? 'You must be at least 15 years old'
              : 'Enter a valid birthday'}
          </Text>
        )}

        <View className="mt-7">
          <Pressable
            onPress={handleSubmit}
            disabled={!formIsValid}
            className={`rounded-full items-center justify-center  h-16 px-4 py-3 ${
              formIsValid ? 'bg-[#1E4FFF]' : 'bg-[#E2E8F0]'
            }`}
          >
            <Text
              className={`text-center text-[20px] font-extrabold ${
                formIsValid ? 'text-white' : 'text-[#94A3B8]'
              }`}
            >
              Complete Profile
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}