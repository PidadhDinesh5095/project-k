
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ArrowLeft, Check, Repeat, SkipForward, X } from 'lucide-react-native';
import { colors, PrimaryButton, StatusPill } from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';
import { formatDate } from '@/lib/cutoff';

export default function SkipDeliveryScreen() {
  const { subscription, updateSubscription, products } = useFreshStore();
  const product = products.find((p) => p.id === subscription.productId)!;

  /*
   * IMPORTANT:
   * Replace this with the dates coming from your backend.
   *
   * Example:
   * const deliveryDates = subscription.deliveryDates;
   */
  const deliveryDates = [
    '2026-09-08',
    '2026-09-09',
    '2026-09-12',
    '2026-09-15',
    '2026-09-19',
    '2026-09-22',
    '2026-09-26',
    '2026-09-29',
  ];

  const [selected, setSelected] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  /*
   * Calendar month is taken from the first backend delivery date.
   * No month changing.
   */
  const calendarDate = useMemo(() => {
    if (deliveryDates.length === 0) return new Date();

    const [year, month] = deliveryDates[0].split('-').map(Number);

    return new Date(year, month - 1, 1);
  }, [deliveryDates]);

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const monthName = calendarDate.toLocaleString('en-US', {
    month: 'long',
  });

  /*
   * Number of days in the month.
   */
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  /*
   * Weekday of the first day.
   * 0 = Sunday
   * 1 = Monday
   * ...
   * 6 = Saturday
   */
  const firstDay = new Date(year, month, 1).getDay();

  /*
   * Create the actual calendar cells.
   * Empty cells are added before day 1 so dates line up correctly.
   */
  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;

      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;

      return {
        day,
        date,
        available: deliveryDates.includes(date),
      };
    }),
  ];

  const toggleDate = (date: string) => {
    if (!deliveryDates.includes(date)) return;

    setSelected((prev) =>
      prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date]
    );
  };

  const sortedSelected = [...selected].sort();

  const confirmSkip = () => {
    updateSubscription({
      skippedDates: [
        ...subscription.skippedDates,
        ...selected,
      ],
    });

    setShowConfirm(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-[#F7F9FC]">
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
        <Text className="mb-4 mt-2 text-[22px] font-extrabold text-[#111827]">
          Skip a Delivery
        </Text>

        {/* Subscription Card */}
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

          <Text className="mt-[10px] text-[18px] font-extrabold text-[#111827]">
            {product.name}
          </Text>

          <Text className="mt-[3px] text-[13px] text-[#64748B]">
            {subscription.planTier} · {subscription.frequency} ·{' '}
            {subscription.timeSlot}
          </Text>
        </View>

        {/* Calendar Heading */}
        <Text className="mb-1 mt-6 text-[15px] font-extrabold text-[#111827]">
          Select dates to skip
        </Text>

        <Text className="mb-3 text-[12px] text-[#64748B]">
          Select your scheduled delivery dates
        </Text>

        {/* Calendar */}
        <View className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
          {/* Month */}
          <Text className="mb-4 text-center text-[17px] font-extrabold text-[#111827]">
            {monthName} {year}
          </Text>

          {/* Weekday Header */}
          <View className="mb-2 flex-row">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
              (day) => (
                <View
                  key={day}
                  className="w-[14.285%] items-center"
                >
                  <Text className="text-[11px] font-bold text-[#64748B]">
                    {day}
                  </Text>
                </View>
              )
            )}
          </View>

          {/* Calendar Dates */}
          <View className="flex-row flex-wrap">
            {calendarDays.map((item, index) => {
              if (!item) {
                return (
                  <View
                    key={`empty-${index}`}
                    className="h-[52px] w-[14.285%]"
                  />
                );
              }

              const isSelected = selected.includes(item.date);

              return (
                <View
                  key={item.date}
                  className="mb-2 h-[52px] w-[14.285%] items-center justify-center"
                >
                  <Pressable
                    disabled={!item.available}
                    onPress={() => toggleDate(item.date)}
                    className={`h-10 w-10 items-center justify-center rounded-full ${
                      isSelected
                        ? 'bg-[#1E4FFF]'
                        : item.available
                          ? 'border border-[#1E4FFF] bg-[#EEF3FF]'
                          : 'bg-transparent'
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-semibold ${
                        isSelected
                          ? 'text-white'
                          : item.available
                            ? 'text-[#1E4FFF]'
                            : 'text-[#CBD5E1]'
                      }`}
                    >
                      {item.day}
                    </Text>

                    {isSelected && (
                      <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-white">
                        <Check size={10} color={colors.primary} />
                      </View>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View className="mt-2 flex-row items-center justify-center gap-5 border-t border-[#F1F5F9] pt-3">
            <View className="flex-row items-center gap-2">
              <View className="h-3 w-3 rounded-full border border-[#1E4FFF] bg-[#EEF3FF]" />

              <Text className="text-[11px] text-[#64748B]">
                Delivery date
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <View className="h-3 w-3 rounded-full bg-[#1E4FFF]" />

              <Text className="text-[11px] text-[#64748B]">
                Selected
              </Text>
            </View>
          </View>
        </View>

        {/* Selected Count */}
        {selected.length > 0 && (
          <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-[#EEF3FF] p-3">
            <SkipForward size={14} color={colors.primary} />

            <Text className="text-[13px] font-semibold text-[#1E4FFF]">
              Skipping {selected.length}{' '}
              {selected.length === 1 ? 'delivery' : 'deliveries'}
            </Text>
          </View>
        )}

        {/* Selected Dates */}
        {sortedSelected.length > 0 && (
          <View className="mt-3 flex-row flex-wrap gap-2">
            {sortedSelected.map((date) => (
              <View
                key={date}
                className="flex-row items-center gap-1.5 rounded-[10px] border border-[#1E4FFF] bg-white px-2.5 py-1.5"
              >
                <Text className="text-[12px] font-semibold text-[#1E4FFF]">
                  {formatDate(date)}
                </Text>

                <Pressable
                  onPress={() => toggleDate(date)}
                  hitSlop={8}
                >
                  <X size={13} color={colors.muted} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Info */}
        <View className="mt-4 rounded-[14px] bg-[#EEF3FF] p-[14px]">
          <Text className="text-[13px] font-bold text-[#1E4FFF]">
            Skip details
          </Text>

          <Text className="mt-2 text-[12px] leading-5 text-[#111827]">
            • No delivery on the selected date(s){'\n'}
            • No charge for skipped deliveries{'\n'}
            • Subscription continues normally after{'\n'}
            • You can skip multiple dates at once
          </Text>
        </View>

        {/* Button */}
        <View className="mt-7">
          <PrimaryButton
            label={
              selected.length === 0
                ? 'Select dates to skip'
                : `Skip ${selected.length} ${
                    selected.length === 1 ? 'delivery' : 'deliveries'
                  }`
            }
            disabled={selected.length === 0}
            onPress={() => setShowConfirm(true)}
          />
        </View>
      </ScrollView>

      {/* Confirmation Popup */}
      {showConfirm && (
        <View className="absolute inset-0 items-center justify-center bg-black/40 px-5">
          <View className="w-full rounded-2xl bg-white p-5">
            <Text className="text-[18px] font-extrabold text-[#111827]">
              Confirm skipped deliveries
            </Text>

            <Text className="mt-2 text-[13px] leading-5 text-[#64748B]">
              Are you sure you want to skip{' '}
              {selected.length === 1
                ? 'this delivery'
                : `these ${selected.length} deliveries`}
              ?
            </Text>

            <View className="mt-4 rounded-xl bg-[#F5F7FB] p-3">
              {sortedSelected.map((date) => (
                <Text
                  key={date}
                  className="mb-1 text-[12px] font-semibold text-[#111827]"
                >
                  • {formatDate(date)}
                </Text>
              ))}
            </View>

            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={() => setShowConfirm(false)}
                className="flex-1 items-center rounded-xl border border-[#E2E8F0] py-3"
              >
                <Text className="font-bold text-[#64748B]">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={confirmSkip}
                className="flex-1 items-center rounded-xl bg-[#1E4FFF] py-3"
              >
                <Text className="font-bold text-white">
                  Confirm Skip
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
