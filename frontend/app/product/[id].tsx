
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { ArrowLeft, Check, Clock, Share2 ,Calendar } from 'lucide-react-native';
import { PrimaryButton ,TrustBadgeRow } from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';
import { formatDate } from '@/lib/cutoff';

function getDateKey(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatLiveDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function getSlotAvailability(dateKey: string | null, currentDate: Date): {
  Morning: boolean;
  Evening: boolean;
} {
  if (!dateKey) {
    return { Morning: false, Evening: false };
  }

  const todayKey = getDateKey(currentDate);
  const nextDayKey = getDateKey(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));

  if (dateKey === todayKey) {
    return {
      Morning: false,
      Evening: currentDate.getHours() < 12,
    };
  }

  if (dateKey === nextDayKey && currentDate.getHours() >= 22) {
    return {
      Morning: false,
      Evening: true,
    };
  }

  return {
    Morning: true,
    Evening: true,
  };
}

function getDefaultSlots(dateKey: string | null, currentDate: Date): string[] {
  const availability = getSlotAvailability(dateKey, currentDate);

  if (availability.Morning && !availability.Evening) {
    return ['Morning'];
  }

  if (availability.Evening && !availability.Morning) {
    return ['Evening'];
  }

  if (availability.Morning && availability.Evening) {
    return ['Morning'];
  }

  return [];
}

const { width: SCREEN_W } = Dimensions.get('window');

const productImages: Record<string, any> = {
  buffalo: require('@/assets/images/products/A2BufalloMilk.png'),
  cow: require('@/assets/images/products/CowMilk.png'),
  cream: require('@/assets/images/products/HighProteinMilk.png'),
  'toned-milk': require('@/assets/images/products/TonedMilk.png'),
  'skim-milk': require('@/assets/images/products/SkimMilk.png'),
  paneer: require('@/assets/images/products/malaipanner.png'),
  curd: require('@/assets/images/products/Curd.png'),
  'cow-curd': require('@/assets/images/products/CowCurd.png'),
  ghee: require('@/assets/images/products/buffaloghee.png'),
  'cow-ghee': require('@/assets/images/products/cowghee.png'),
  'buffalo-butter': require('@/assets/images/products/buffalobutter.png'),
  'cow-butter': require('@/assets/images/products/cowbutter.png'),
  oat: require('@/assets/images/products/SkimMilk.png'),
  almond: require('@/assets/images/products/Curd.png'),
  coconut: require('@/assets/images/products/Curd.png'),
};

function generateDeliveryDates(currentDate: Date = new Date()): {
  value: string;
  label: string;
  day: string;
  isSelectable: boolean;
}[] {
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const isBeforeNoon = currentDate.getHours() < 12;

  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);

    const value = getDateKey(date);
    const isSelectable = isBeforeNoon ? offset === 0 : offset > 0;

    return {
      value,
      label: String(date.getDate()),
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
      isSelectable,
    };
  });
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { products } = useFreshStore();

  const product = products.find((p) => p.id === id) ?? products[0];

  const [showBuyOnce, setShowBuyOnce] = useState(false);
  const [liveDate, setLiveDate] = useState(new Date());
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const todayKey = getDateKey(liveDate);
  const isBeforeNoon = liveDate.getHours() < 12;

  useEffect(() => {
    const interval = setInterval(() => setLiveDate(new Date()), 60000);

    return () => clearInterval(interval);
  }, []);

  const deliveryDates = useMemo(() => generateDeliveryDates(liveDate), [liveDate]);

  useEffect(() => {
    const defaultDate = deliveryDates.find((date) => date.isSelectable)?.value ?? null;

    const selectedDateStillValid =
      selectedDate && deliveryDates.some((date) => date.value === selectedDate && date.isSelectable);

    if (!selectedDate && defaultDate) {
      setSelectedDate(defaultDate);
    }

    if (selectedDate && !selectedDateStillValid && defaultDate) {
      setSelectedDate(defaultDate);
      setSelectedSlots(getDefaultSlots(defaultDate, liveDate));
      return;
    }

    if (!selectedSlots.length) {
      setSelectedSlots(getDefaultSlots(selectedDate ?? defaultDate, liveDate));
    }
  }, [deliveryDates, liveDate, selectedDate, selectedSlots.length]);

  const selectedDateInfo = deliveryDates.find((date) => date.value === selectedDate);

  const slotOptions = useMemo(() => {
    return getSlotAvailability(selectedDate, liveDate);
  }, [liveDate, selectedDate]);

  const slotMultiplier = selectedSlots.length === 2 ? 2 : selectedSlots.length === 1 ? 1 : 0;
  const totalAmount = product.price * quantity * slotMultiplier;

  const highlightColors = [
    { bg: '#EAF3EA', text: '#023E8A' },
    { bg: '#F3E9DC', text: '#023E8A' },
    { bg: '#EAF1FF', text: '#023E8A' },
    { bg: '#F3E7F7', text: '#023E8A' },
    { bg: '#FFF3D6', text: '#023E8A' },
  ];

  const handleBuyOnceConfirm = () => {
    setShowBuyOnce(false);
    setShowSuccess(true);
  };

  return (
    <View className="flex-1 bg-[#f5f4f1]">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Image
          source={productImages[product.id] ?? productImages.cow}
          style={{ width: SCREEN_W, height: SCREEN_W , alignSelf: 'center' }}
          resizeMode="contain"
        />

        <Pressable
          className="absolute left-5 top-[12px] h-9 w-9 items-center justify-center rounded-full "
          onPress={() => router.back()}
          hitSlop={12}
        >
          <ArrowLeft size={26} color="#1F2937" />
        </Pressable>

        <Pressable
          className="absolute right-5 top-[12px] h-9 w-9 items-center justify-center rounded-full "
          hitSlop={12}
        >
          <Share2 size={24} color="#1F2937" />
        </Pressable>

        <View className="mx-4 mt-4 pb-2">
          <Text className="text-[26px] font-raleway-bold tracking-[-0.4px] text-[#141414]">
            {product.name}
          </Text>

          <Text className="mt-1 ml-1 text-[14px] font-bold text-[#4b5563]">
            {product.size}
          </Text>

          <View className="mt-2 flex-row flex-wrap gap-2.5">
            {product.tags.map((tag, index) => {
              const color = highlightColors[index % highlightColors.length];

              return (
                <View
                  key={tag}
                  className="rounded-[10px] px-3 py-[6px]"
                  style={{ backgroundColor: color.bg }}
                >
                  <Text
                    className="text-[13px] font-raleway-semibold"
                    style={{ color: color.text }}
                  >
                    {tag}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text className="mt-6 text-[20px] font-raleway-bold text-[#111827]">
            Description
          </Text>

          <Text className="mt-3 text-[14px] font-raleway-semibold leading-[24px] text-[#475569]">
            {product.description}
          </Text>

          <Text className="mt-6 text-[20px] font-raleway-bold text-[#111827]">
            Nutritional Benefits
          </Text>

          <View className="mt-4 overflow-hidden rounded-[14px] border border-[#e4dfd6] bg-transparent">
            {(product.nutritionBenefits ?? []).map((item, index, arr) => (
              <View
                key={`${item.label}-${index}`}
                className={
                  index === arr.length - 1
                    ? 'flex-row items-center justify-between px-4 py-4'
                    : 'flex-row items-center justify-between border-b border-[#e4dfd6] px-4 py-4'
                }
              >
                <Text className="text-[14px] font-raleway-bold text-[#1f2937]">
                  {item.label}
                </Text>
                <Text className="text-[14px] font-bold text-[#111827]">
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
          <TrustBadgeRow />

         

        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#e7e5e2] bg-[#f5f4f1] px-4 pb-4 pt-3">
        

        <View className="mb-3 ml-1 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="text-[30px] font-bold text-[#111827]">
              ₹{product.price}
            </Text>

            <Text className="text-[18px] font-raleway-semibold text-[#64748B] line-through">
              ₹{product.mrp}
            </Text>

            <View className="rounded-[8px] bg-[#DCFCE7] px-2 py-[2px]">
              <Text className="text-[11px] font-raleway-bold text-[#15803D]">
                Save ₹{product.mrp - product.price}
              </Text>
            </View>
          </View>

          <Text className="text-[15px] font-raleway-bold text-[#1f2937]">
            Delivery for {formatLiveDate(liveDate)}
          </Text>
        </View>

        <View className="flex-row gap-3 mb-2">
          <Pressable
            className="flex-1 h-15 items-center justify-center rounded-full border border-[#d8d5d0]   py-3"
            onPress={() => setShowBuyOnce(true)}
          >
            <Text className="text-[18px] font-raleway-bold text-black ">
              Add
            </Text>
          </Pressable>

          <Pressable
            className="flex-1 h-15 flex-row items-center justify-center gap-2 rounded-full   bg-[#023E8A] py-3"
            onPress={() => router.push(`/subscribe/${product.id}`)}
          >
            <Calendar size={18} color="#ffffff" />
            <Text className="text-[16px] font-raleway-bold text-white">
              Subscribe
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Buy Once Modal */}
      <Modal
        visible={showBuyOnce}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBuyOnce(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-[24px] bg-white p-5 pb-[34px]">
            {/* Handle */}
            <View className="mb-4 h-1 w-10 self-center rounded-[2px] bg-[#E2E8F0]" />

            <Text className="mt-1 text-[18px] font-raleway-bold text-black">
              {product.name} · {product.size} · ₹{product.price}
            </Text>

            {/* Date */}
            <Text className="mb-2.5 mt-2 text-[14px] font-raleway-bold text-[#111827]">
              Select delivery date
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {deliveryDates.map((dateItem) => {
                const active = selectedDate === dateItem.value;
                const disabled = !dateItem.isSelectable;

                return (
                  <Pressable
                    key={dateItem.value}
                    className={
                      active
                        ? 'h-16 w-[60px] items-center justify-center rounded-[14px] bg-[#023E8A]'
                        : disabled
                          ? 'h-16 w-[60px] items-center justify-center rounded-[14px] bg-[#F3F4F6] opacity-40'
                          : 'h-16 w-[60px] items-center justify-center rounded-[14px] bg-[#F5F7FB]'
                    }
                    disabled={disabled}
                    onPress={() => {
                      if (!disabled) {
                        setSelectedDate(dateItem.value);
                        setSelectedSlots(getDefaultSlots(dateItem.value, liveDate));
                      }
                    }}
                  >
                    <Text
                      className={
                        active
                          ? 'text-[12px] font-raleway-bold text-[#DCE6FF]'
                          : disabled
                            ? 'text-[12px] font-raleway-bold text-[#94A3B8]'
                            : 'text-[12px] font-raleway-bold text-[#64748B]'
                      }
                    >
                      {dateItem.day}
                    </Text>

                    <Text
                      className={
                        active
                          ? 'mt-[3px] text-[18px] font-bold text-white'
                          : disabled
                            ? 'mt-[3px] text-[18px] font-bold text-[#94A3B8]'
                            : 'mt-[3px] text-[18px] font-bold text-[#111827]'
                      }
                    >
                      {dateItem.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Time Slot */}
            <Text className="mb-2.5 mt-5 text-[14px] font-raleway-bold text-[#111827]">
              Preferred time slot
            </Text>

            

            <View className="flex-row flex-wrap gap-2">
              {['Morning', 'Evening'].map((slot) => {
                const isSelected = selectedSlots.includes(slot);
                const disabled = !slotOptions[slot as keyof typeof slotOptions];

                return (
                  <Pressable
                    key={slot}
                    className={
                      isSelected
                        ? 'h-10 flex-row items-center gap-[5px] rounded-[14px] bg-[#023E8A] px-4'
                        : disabled
                          ? 'h-10 flex-row items-center gap-[5px] rounded-[14px] bg-[#F3F4F6] px-4 opacity-40'
                          : 'h-10 flex-row items-center gap-[5px] rounded-[14px] bg-[#F5F7FB] px-4'
                    }
                    disabled={disabled}
                    onPress={() => {
                      if (disabled) {
                        return;
                      }

                      setSelectedSlots((current) => {
                        const next = current.includes(slot)
                          ? current.filter((item) => item !== slot)
                          : [...current, slot];

                        return next;
                      });
                    }}
                  >
                    {isSelected && <Check size={12} color="#fff" />}

                    <Text
                      className={
                        isSelected
                          ? 'text-[13px] font-raleway-bold text-white'
                          : disabled
                            ? 'text-[13px] font-raleway-bold text-[#94A3B8]'
                            : 'text-[13px] font-raleway-bold text-[#111827]'
                      }
                    >
                      {slot}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-4 flex-row items-center justify-between rounded-[14px]  bg-[#F5F7FB] px-3 py-3">
              <Text className="text-[16px] font-raleway-bold p-1 text-[#111827]">Quantity</Text>

              <View className="flex-row items-center gap-3">
                <Pressable
                  className="h-8 w-8 items-center justify-center rounded-full"
                  onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  <Text className="text-[22px] font-raleway-bold text-[#111827]">−</Text>
                </Pressable>

                <Text className="min-w-[24px] text-center text-[16px]  text-[#111827]">
                  {quantity}
                </Text>

                <Pressable
                  className="h-8 w-8 items-center justify-center rounded-full "
                  onPress={() => setQuantity((current) => Math.min(9, current + 1))}
                >
                  <Text className="text-[22px] font-raleway-bold text-[#111827]">+</Text>
                </Pressable>
              </View>
            </View>

            {/* Summary */}
            <View className="mt-5 flex-row justify-between border-t border-[#F1F5F9] pt-4">
              <View>
                <Text className="text-[11px] font-raleway-bold text-[#64748B]">
                  Item
                </Text>

                <Text className="mt-[2px] text-[13px] font-raleway-bold text-[#111827]">
                  {product.name}
                </Text>
              </View>

              <View>
                <Text className="text-[11px] font-raleway-bold text-[#64748B]">
                  Delivery
                </Text>

                <Text className="mt-[2px] text-[13px] font-raleway-bold text-[#111827]">
                  {selectedDate
                    ? formatDate(selectedDate)
                    : 'Select date'}
                </Text>
              </View>

              <View>
                <Text className="text-[11px] font-raleway-bold text-[#64748B]">
                  Slot
                </Text>

                <Text className="mt-[2px] text-[13px] font-raleway-bold text-[#111827]">
                  {selectedSlots.length
                    ? selectedSlots.join(' + ')
                    : 'Select slot'}
                </Text>
              </View>

              <View>
                <Text className="text-[11px] font-raleway-bold text-[#64748B]">
                  Total
                </Text>

                <Text className="mt-[2px] text-[13px] font-raleway-bold text-[#111827]">
                  ₹{totalAmount}
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View className="mt-5 flex-row gap-2.5">
              <Pressable
                className="justify-center px-4"
                onPress={() => setShowBuyOnce(false)}
              >
                <Text className="text-[14px] font-raleway-bold text-[#64748B] underline">
                  Cancel
                </Text>
              </Pressable>

              <View className="flex-1">
                <PrimaryButton
                  label="Confirm Order"
                  disabled={
                    !selectedDate ||
                    selectedSlots.length === 0 ||
                    !selectedDateInfo?.isSelectable ||
                    selectedSlots.some((slot) => !slotOptions[slot as keyof typeof slotOptions])
                  }
                  onPress={handleBuyOnceConfirm}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="mt-[40%] w-[90%] self-center items-center rounded-[20px] bg-white p-7">
            <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[#22C55E]">
              <Check size={28} color="#fff" />
            </View>

            <Text className="text-[18px] font-raleway-bold text-[#111827]">
              Order Placed!
            </Text>

            <Text className="mt-2 text-center text-[14px] font-raleway-semibold leading-5 text-[#64748B]">
              Your {product.name} will be delivered on{' '}
              {selectedDate
                ? formatDate(selectedDate)
                : formatDate(product.nextDeliveryDate)}{' '}
              ({selectedSlots.join(' + ')}) in the selected slot.
            </Text>

            <Pressable
              className="mt-5 w-full items-center rounded-[14px] bg-[#023E8A] px-8 py-[14px]"
              onPress={() => {
                setShowSuccess(false);
                router.replace('/(tabs)/orders');
              }}
            >
              <Text className="text-[15px] font-raleway-bold text-white">
                Track My Order
              </Text>
            </Pressable>

            <Pressable
              className="mt-[14px]"
              onPress={() => {
                setShowSuccess(false);
                router.replace('/(tabs)');
              }}
            >
              <Text className="text-[14px] font-raleway-bold text-[#023E8A]">
                Back to Home
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

