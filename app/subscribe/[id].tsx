
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { ArrowLeft, Check, ChevronRight, Clock, MapPin } from 'lucide-react-native';
import { colors, PrimaryButton } from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';
import { formatDate, isBeforeCutoff } from '@/lib/cutoff';

const plans = [
  {
    id: 'Starter',
    label: 'Starter',
    sub: '1 unit per delivery',
    price: '₹63/delivery',
  },
  {
    id: 'Family',
    label: 'Family',
    sub: '2 units per delivery',
    price: '₹126/delivery',
  },
  {
    id: 'Bulk',
    label: 'Bulk',
    sub: '4 units per delivery',
    price: '₹252/delivery',
  },
];

const freqs = ['Daily', 'Alternate Days', 'Weekly'];
const slots = ['Morning', 'Evening'];

export default function SubscribeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { user, updateSubscription, products } = useFreshStore();

  const product =
    products.find((p) => p.id === id) ?? products[0];

  const nextDate = formatDate(product.nextDeliveryDate);

  const [plan, setPlan] = useState('Family');
  const [freq, setFreq] = useState('Daily');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([
    'Morning',
  ]);
  const [duration, setDuration] = useState('Ongoing');
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((s) => s !== slot)
        : [...prev, slot]
    );
  };

  const handleConfirm = () => {
    updateSubscription({
      productId: product.id,
      planTier: plan as 'Starter' | 'Family' | 'Bulk',
      frequency: freq as 'Daily' | 'Alternate Days' | 'Weekly',
      timeSlot: selectedSlots[0] as 'Morning' | 'Evening',
      status: 'Active',
      nextDeliveryDate: product.nextDeliveryDate,
    });

    setShowSuccess(true);
  };

  return (
    <View className="flex-1 bg-white">

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
        {/* Header */}
        <Text className="mt-2 text-[22px] font-extrabold text-[#111827]">
          Set Up Subscription
        </Text>

        <Text className="mt-1 text-[14px] text-[#64748B]">
          {product.name} · {product.size}
        </Text>

        {/* Choose a Plan */}
        <Text className="mt-6 mb-[10px] text-[15px] font-extrabold text-[#111827]">
          Choose a plan
        </Text>

        {plans.map((p) => {
          const active = plan === p.id;

          return (
            <Pressable
              key={p.id}
              onPress={() => setPlan(p.id)}
              className={`mb-[10px] flex-row items-center justify-between rounded-[14px] border p-[14px] ${
                active
                  ? 'border-[#1E4FFF] bg-[#EEF3FF]'
                  : 'border-[#E2E8F0]'
              }`}
            >
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-[#111827]">
                  {p.label}
                </Text>

                <Text className="mt-[2px] text-[12px] text-[#64748B]">
                  {p.sub}
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Text className="text-[13px] font-bold text-[#111827]">
                  {p.price}
                </Text>

                {active && (
                  <View className="h-5 w-5 items-center justify-center rounded-full bg-[#1E4FFF]">
                    <Check size={12} color="#fff" />
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}

        {/* Delivery Frequency */}
        <Text className="mt-6 mb-[10px] text-[15px] font-extrabold text-[#111827]">
          Delivery frequency
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {freqs.map((f) => {
            const active = freq === f;

            return (
              <Pressable
                key={f}
                onPress={() => setFreq(f)}
                className={`h-10 flex-row items-center justify-center rounded-[14px] px-4 ${
                  active
                    ? 'bg-[#1E4FFF]'
                    : 'bg-[#F5F7FB]'
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold leading-4 ${
                    active ? 'text-white' : 'text-[#111827]'
                  }`}
                >
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Preferred Time Slot */}
        <Text className="mt-6 mb-[10px] text-[15px] font-extrabold text-[#111827]">
          Preferred time slot
        </Text>

        <Text className="mt-[-6px] mb-[10px] text-[12px] text-[#64748B]">
          Select one or both slots
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {slots.map((sl) => {
            const isSelected = selectedSlots.includes(sl);

            return (
              <Pressable
                key={sl}
                onPress={() => toggleSlot(sl)}
                className={`h-10 flex-row items-center justify-center gap-[5px] rounded-[14px] px-4 ${
                  isSelected
                    ? 'bg-[#1E4FFF]'
                    : 'bg-[#F5F7FB]'
                }`}
              >
                {isSelected && (
                  <Check size={12} color="#fff" />
                )}

                <Text
                  className={`text-[13px] font-semibold leading-4 ${
                    isSelected
                      ? 'text-white'
                      : 'text-[#111827]'
                  }`}
                >
                  {sl}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Delivery Address */}
        <Text className="mt-6 mb-[10px] text-[15px] font-extrabold text-[#111827]">
          Delivery address
        </Text>

        <Pressable
          onPress={() => router.push('/addresses')}
          className="flex-row items-center gap-[10px] rounded-[14px] border border-[#E2E8F0] p-[14px]"
        >
          <MapPin size={16} color={colors.primary} />

          <View className="flex-1">
            <Text className="text-[14px] font-bold text-[#111827]">
              {user.addresses[0].label}
            </Text>

            <Text className="mt-[2px] text-[12px] text-[#64748B]">
              {user.addresses[0].line1}, {user.addresses[0].city} -{' '}
              {user.addresses[0].pincode}
            </Text>
          </View>

          <ChevronRight size={16} color={colors.muted} />
        </Pressable>

        {/* Cutoff Banner */}
        <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-[#EEF3FF] p-3">
          <Clock size={14} color={colors.primary} />

          <Text className="flex-1 text-[12px] font-semibold text-[#1E4FFF]">
            {isBeforeCutoff()
              ? 'Order placed! Delivery by 7 AM'
              : 'Past 10 PM cutoff — delivery starts day after'}{' '}
            · {nextDate}
          </Text>
        </View>

        {/* Duration */}
        <Text className="mt-6 mb-[10px] text-[15px] font-extrabold text-[#111827]">
          Duration
        </Text>

        <View className="flex-row flex-wrap gap-2">
          <Pressable
            onPress={() => setDuration('Ongoing')}
            className={`h-10 flex-row items-center justify-center rounded-[14px] px-4 ${
              duration === 'Ongoing'
                ? 'bg-[#1E4FFF]'
                : 'bg-[#F5F7FB]'
            }`}
          >
            <Text
              className={`text-[13px] font-semibold leading-4 ${
                duration === 'Ongoing'
                  ? 'text-white'
                  : 'text-[#111827]'
              }`}
            >
              Ongoing
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setDuration('EndDate')}
            className={`h-10 flex-row items-center justify-center rounded-[14px] px-4 ${
              duration === 'EndDate'
                ? 'bg-[#1E4FFF]'
                : 'bg-[#F5F7FB]'
            }`}
          >
            <Text
              className={`text-[13px] font-semibold leading-4 ${
                duration === 'EndDate'
                  ? 'text-white'
                  : 'text-[#111827]'
              }`}
            >
              End Date
            </Text>
          </Pressable>
        </View>

        {/* Confirm Button */}
        <View className="mt-7">
          <PrimaryButton
            label="Confirm Subscription"
            disabled={selectedSlots.length === 0}
            onPress={handleConfirm}
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

            {/* Success Icon */}
            <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[#22C55E]">
              <Check size={28} color="#fff" />
            </View>

            <Text className="text-[18px] font-extrabold text-[#111827]">
              Subscription Activated!
            </Text>

            <Text className="mt-2 text-center text-[14px] leading-5 text-[#64748B]">
              Your {product.name} subscription is now active. First
              delivery on {nextDate}.
            </Text>

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
