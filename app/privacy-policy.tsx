import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '@/components/FreshComponents';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'We may collect your name, phone number, delivery address, order details, payment information, and app usage data needed to provide and improve our services.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to process orders, manage subscriptions, communicate updates, provide customer support, and improve the quality of our services.',
  },
  {
    title: '3. Data Security',
    body: 'We apply reasonable security measures to protect your data from unauthorized access, misuse, or disclosure. However, no system is completely immune to risk.',
  },
  {
    title: '4. Sharing Information',
    body: 'We may share your information with trusted service providers for payment processing, delivery support, and operational needs, as required to provide the service.',
  },
  {
    title: '5. Cookies & Analytics',
    body: 'We may use analytics tools to understand app usage patterns and improve user experience. These tools may collect limited technical information.',
  },
  {
    title: '6. Your Choices',
    body: 'You can update your account details, manage notifications, and contact us if you want to review, update, or delete your personal data where applicable.',
  },
  {
    title: '7. Changes to This Policy',
    body: 'We may revise this Privacy Policy occasionally. Any material changes will be reflected in the app and will take effect from the date posted.',
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <View className="flex-1  bg-[#F7F9FC]">
      <ScreenHeader title="Privacy Policy" onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-[18px] border border-[#E2E8F0] bg-white p-5">
          <Text className="text-[20px] font-extrabold text-[#111827]">
            Privacy Policy
          </Text>

          <Text className="mt-1 text-[12px] font-medium text-[#94A3B8]">
            Last updated: January 1, 2026
          </Text>

          <Text className="mt-4 text-[14px] leading-6 text-[#475569]">
            This Privacy Policy explains how Dinesh Farms collects, uses, stores, and protects your personal information when you use our app and services.
          </Text>

          <View className="mt-5 gap-5">
            {SECTIONS.map((section) => (
              <View key={section.title}>
                <Text className="mb-1.5 text-[15px] font-bold text-[#111827]">
                  {section.title}
                </Text>
                <Text className="text-[14px] leading-6 text-[#475569]">
                  {section.body}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-4 rounded-[18px] border border-[#E2E8F0] bg-white p-5">
          <Text className="mb-1.5 text-[15px] font-bold text-[#111827]">
            Contact Us
          </Text>
          <Text className="mb-3 text-[14px] leading-6 text-[#475569]">
            If you have questions about this Privacy Policy or how your data is handled, reach out to us:
          </Text>

          <Text className="text-[14px] font-semibold text-[#1E4FFF]">
            support@dineshfarms.in
          </Text>
          <Text className="mt-1 text-[14px] font-semibold text-[#1E4FFF]">
            +91 98765 43210
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}