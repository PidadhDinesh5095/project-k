
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { ArrowLeft, Check, Pause, Repeat } from 'lucide-react-native';
import {
  colors,
  PrimaryButton,
  StatusPill,
} from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';
import { formatDate } from '@/lib/cutoff';

const pauseDurations = [
  { id: '3', label: '3 days', sub: 'Until 9 Sep' },
  { id: '7', label: '7 days', sub: 'Until 13 Sep' },
  { id: '14', label: '14 days', sub: 'Until 20 Sep' },
  { id: '30', label: '30 days', sub: 'Until 6 Oct' },
];

export default function PauseSubscriptionScreen() {
  const {
    subscription,
    updateSubscription,
    products,
  } = useFreshStore();

  const product = products.find(
    (p) => p.id === subscription.productId
  )!;

  const [selected, setSelected] = useState('3');
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <View className="flex-1 bg-[#F7F9FC]">

      {/* Back Button */}
      <Pressable
        className="ml-4 mt-2"
        onPress={() => router.back()}
        hitSlop={12}
      >
        <Text className="text-[32px] leading-[30px] text-[#111827]">
          <ArrowLeft size={28} color="#111827" />
        </Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      >
        {/* Title */}
        <Text className="mt-2 mb-4 text-[22px] font-extrabold text-[#111827]">
          Pause Subscription
        </Text>

        {/* Subscription Card */}
        <View className="rounded-[16px] border border-[#E2E8F0] bg-white p-[14px]">

          {/* Card Top */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1 rounded-[10px] bg-[#1E4FFF] px-2 py-1">
              <Repeat size={12} color="#fff" />

              <Text className="text-[10px] font-bold text-white">
                Subscription
              </Text>
            </View>

            <StatusPill label={subscription.status} />
          </View>

          {/* Product */}
          <Text className="mt-[10px] text-[18px] font-extrabold text-[#111827]">
            {product.name}
          </Text>

          <Text className="mt-[3px] text-[13px] text-[#64748B]">
            {subscription.planTier} · {subscription.frequency} ·{' '}
            {subscription.timeSlot}
          </Text>
        </View>

        {/* Pause Duration */}
        <Text className="mt-6 mb-[10px] text-[15px] font-extrabold text-[#111827]">
          Choose pause duration
        </Text>

        {pauseDurations.map((d) => {
          const active = selected === d.id;

          return (
            <Pressable
              key={d.id}
              onPress={() => setSelected(d.id)}
              className={`mb-[10px] min-h-[66px] flex-row items-center justify-between rounded-[14px] border bg-white p-[14px] ${
                active
                  ? 'border-[#1E4FFF] bg-[#F5F8FF]'
                  : 'border-[#E2E8F0]'
              }`}
            >
              {/* Left Side */}
              <View className="flex-row items-center gap-3">
                <View
                  className={`h-9 w-9 items-center justify-center rounded-[10px] ${
                    active
                      ? 'bg-[#1E4FFF]'
                      : 'bg-[#FEF3C7]'
                  }`}
                >
                  <Pause
                    size={16}
                    color={active ? '#fff' : colors.amber}
                  />
                </View>

                <View>
                  <Text className="text-[14px] font-bold text-[#111827]">
                    Pause for {d.label}
                  </Text>

                  <Text className="mt-[2px] text-[12px] text-[#64748B]">
                    Resumes on {d.sub}
                  </Text>
                </View>
              </View>

              {/* Radio */}
              <View
                className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                  active
                    ? 'border-[#1E4FFF]'
                    : 'border-[#E2E8F0]'
                }`}
              >
                {active && (
                  <View className="h-[10px] w-[10px] rounded-full bg-[#1E4FFF]" />
                )}
              </View>
            </Pressable>
          );
        })}

        {/* Information Box */}
        <View className="mt-4 rounded-[14px] bg-[#FEF3C7] p-[14px]">

          <Text className="text-[13px] font-bold text-[#92400E]">
            What happens when you pause?
          </Text>

          <Text className="mt-2 text-[12px] leading-5 text-[#92400E]">
            • No deliveries during the pause period{'\n'}
            • No charges applied{'\n'}
            • Subscription auto-resumes after the pause ends{'\n'}
            • You can resume early anytime
          </Text>
        </View>

        {/* Pause Button */}
        <View className="mt-7">
          <PrimaryButton
            label="Pause Subscription"
            onPress={() => {
              updateSubscription({
                status: 'Paused',
              });

              setShowSuccess(true);
            }}
          />
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-10">

          <View className="w-full items-center rounded-[20px] bg-white p-7">

            {/* Pause Icon */}
            <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[#F59E0B]">
              <Pause size={28} color="#fff" />
            </View>

            {/* Title */}
            <Text className="text-[18px] font-extrabold text-[#111827]">
              Subscription Paused
            </Text>

            {/* Body */}
            <Text className="mt-2 text-center text-[14px] leading-5 text-[#64748B]">
              Your subscription has been paused. It will auto-resume
              after the selected period.
            </Text>

            {/* Back Home */}
            <Pressable
              className="mt-5 w-full items-center rounded-[14px] bg-[#1E4FFF] px-8 py-[14px]"
              onPress={() => {
                setShowSuccess(false);
                router.replace('/(tabs)');
              }}
            >
              <Text className="text-[15px] font-bold text-white">
                Back to Home
              </Text>
            </Pressable>

          </View>
        </View>
      </Modal>
    </View>
  );
}
