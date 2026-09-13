
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Pause,
  Repeat,
  SkipForward,
} from 'lucide-react-native';
import {
  colors,
  PrimaryButton,
  SectionTitle,
  StatusPill,
} from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';
import { formatDate } from '@/lib/cutoff';

export default function SubscriptionScreen() {
  const {
    subscription,
    user,
    updateSubscription,
    products,
  } = useFreshStore();

  const product = products.find(
    (p) => p.id === subscription.productId
  )!;

  const addr = user.addresses.find(
    (a) => a.id === subscription.deliveryAddressId
  )!;

  return (
    <View className="flex-1 bg-[#F7F9FC] pt-[52px]">
      <Pressable
        className="px-5"
        onPress={() => router.back()}
      >
        <Text className="text-[32px] leading-[30px] text-[#111827]">
          ‹
        </Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      >
        <Text className="mb-4 mt-2 text-[22px] font-extrabold text-[#111827]">
          My Subscription
        </Text>

        <View className="rounded-2xl border border-[#E2E8F0] bg-white p-[14px]">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1 rounded-[10px] bg-[#1E4FFF] px-2 py-1">
              <Repeat size={12} color="#fff" />

              <Text className="text-[10px] font-bold text-white">
                Subscription
              </Text>
            </View>

            <StatusPill label={subscription.status} />
          </View>

          <Text className="mt-2.5 text-[18px] font-extrabold text-[#111827]">
            {product.name}
          </Text>

          <Text className="mt-0.5 text-[13px] text-[#64748B]">
            {subscription.planTier} · {subscription.quantityPerDelivery} ×{' '}
            {product.size} · {subscription.frequency}
          </Text>

          <View className="mt-3 flex-row gap-4 border-t border-[#F1F5F9] pt-3">
            <View className="flex-row items-center gap-[5px]">
              <Clock size={14} color={colors.muted} />

              <Text className="text-[12px] font-semibold text-[#111827]">
                {subscription.timeSlot} delivery
              </Text>
            </View>

            <View className="flex-row items-center gap-[5px]">
              <Calendar size={14} color={colors.muted} />

              <Text className="text-[12px] font-semibold text-[#111827]">
                Next: {formatDate(subscription.nextDeliveryDate)}
              </Text>
            </View>
          </View>
        </View>

        <SectionTitle title="Delivery Details" />

        <View className="rounded-2xl border border-[#E2E8F0] bg-white p-[14px]">
          <View className="flex-row items-center gap-3">
            <MapPin size={16} color={colors.primary} />

            <View className="flex-1">
              <Text className="text-[11px] text-[#64748B]">
                Address
              </Text>

              <Text className="mt-0.5 text-[14px] font-semibold text-[#111827]">
                {addr.label} · {addr.line1}, {addr.city}
              </Text>
            </View>
          </View>

          <View className="my-3 h-px bg-[#F1F5F9]" />

          <View className="flex-row items-center gap-3">
            <Repeat size={16} color={colors.primary} />

            <View className="flex-1">
              <Text className="text-[11px] text-[#64748B]">
                Plan
              </Text>

              <Text className="mt-0.5 text-[14px] font-semibold text-[#111827]">
                {subscription.planTier} · {subscription.frequency}
              </Text>
            </View>
          </View>

          <View className="my-3 h-px bg-[#F1F5F9]" />

          <View className="flex-row items-center gap-3">
            <Clock size={16} color={colors.primary} />

            <View className="flex-1">
              <Text className="text-[11px] text-[#64748B]">
                Time Slot
              </Text>

              <Text className="mt-0.5 text-[14px] font-semibold text-[#111827]">
                {subscription.timeSlot}
              </Text>
            </View>
          </View>
        </View>

        <SectionTitle title="Manage Subscription" />

        <Pressable
          className="mb-2.5 flex-row items-center justify-between rounded-[14px] border border-[#E2E8F0] bg-white p-[14px]"
          onPress={() => router.push('/subscription/pause')}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-[10px] bg-[#FEF3C7]">
              <Pause size={18} color={colors.amber} />
            </View>

            <Text className="text-[14px] font-bold text-[#111827]">
              Pause Subscription
            </Text>
          </View>

          <ChevronRight size={18} color={colors.muted} />
        </Pressable>

        <Pressable
          className="mb-2.5 flex-row items-center justify-between rounded-[14px] border border-[#E2E8F0] bg-white p-[14px]"
          onPress={() => router.push('/subscription/skip')}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-[10px] bg-[#EEF3FF]">
              <SkipForward size={18} color={colors.primary} />
            </View>

            <Text className="text-[14px] font-bold text-[#111827]">
              Skip a Delivery
            </Text>
          </View>

          <ChevronRight size={18} color={colors.muted} />
        </Pressable>

        <Pressable
          className="mb-2.5 flex-row items-center justify-between rounded-[14px] border border-[#E2E8F0] bg-white p-[14px]"
          onPress={() => router.push('/subscription/manage')}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-[10px] bg-[#EEF3FF]">
              <Calendar size={18} color={colors.primary} />
            </View>

            <Text className="text-[14px] font-bold text-[#111827]">
              Change Schedule
            </Text>
          </View>

          <ChevronRight size={18} color={colors.muted} />
        </Pressable>

        <View className="mt-6">
          {subscription.status === 'Active' ||
          subscription.status === 'Paused' ? (
            <Pressable
              className="items-center py-3.5"
              onPress={() => router.push('/subscription/cancel')}
            >
              <Text className="text-[14px] font-semibold text-[#EF4444] underline">
                Cancel Subscription
              </Text>
            </Pressable>
          ) : (
            <PrimaryButton
              label="Resume Subscription"
              onPress={() => {
                updateSubscription({ status: 'Active' });
                router.back();
              }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
