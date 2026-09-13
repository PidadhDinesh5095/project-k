import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '@/components/FreshComponents';

export default function TermsScreen() {
  return (
    <View className="flex-1 bg-[#F7F9FC]">
      <ScreenHeader title="Terms & Conditions" onBack={() => router.back()} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="rounded-[18px] border border-[#E2E8F0] bg-white p-4">
          <Text className="mb-3 text-[20px] font-extrabold text-[#111827]">
            Terms & Conditions
          </Text>

          <Text className="mb-3 text-[14px] leading-6 text-[#475569]">
            By using Dinesh Farms, you agree to these terms and conditions. Please read them carefully before placing orders or subscribing to any services.
          </Text>

          <Text className="mb-2 text-[15px] font-bold text-[#111827]">1. Service Usage</Text>
          <Text className="mb-3 text-[14px] leading-6 text-[#475569]">
            You agree to use our app only for lawful purposes and to provide accurate information for delivery, payment, and subscription services.
          </Text>

          <Text className="mb-2 text-[15px] font-bold text-[#111827]">2. Orders & Deliveries</Text>
          <Text className="mb-3 text-[14px] leading-6 text-[#475569]">
            Orders are subject to product availability, delivery timings, and confirmation by our team. We reserve the right to reschedule, cancel, or modify orders when necessary.
          </Text>

          <Text className="mb-2 text-[15px] font-bold text-[#111827]">3. Subscriptions</Text>
          <Text className="mb-3 text-[14px] leading-6 text-[#475569]">
            Subscription plans, delivery slots, and pricing may be updated from time to time. Changes will be reflected in the app and applied after due notice.
          </Text>

          <Text className="mb-2 text-[15px] font-bold text-[#111827]">4. Payments</Text>
          <Text className="mb-3 text-[14px] leading-6 text-[#475569]">
            All payments are processed through secure payment methods. Orders will only be confirmed after successful payment authorization.
          </Text>

          <Text className="mb-2 text-[15px] font-bold text-[#111827]">5. Account Responsibility</Text>
          <Text className="mb-3 text-[14px] leading-6 text-[#475569]">
            You are responsible for maintaining the confidentiality of your account and for all actions taken through your account.
          </Text>

          <Text className="mb-2 text-[15px] font-bold text-[#111827]">6. Limitation of Liability</Text>
          <Text className="mb-3 text-[14px] leading-6 text-[#475569]">
            Dinesh Farms shall not be liable for indirect, incidental, or consequential damages arising from the use of our services.
          </Text>

          <Text className="mb-2 text-[15px] font-bold text-[#111827]">7. Changes</Text>
          <Text className="text-[14px] leading-6 text-[#475569]">
            We may update these terms from time to time. Continued use of the app after changes constitutes your acceptance of the updated terms.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
