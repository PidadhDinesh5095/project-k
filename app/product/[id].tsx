
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { ArrowLeft, Check, Clock } from 'lucide-react-native';
import { PrimaryButton, TrustBadgeRow } from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';
import { formatDate } from '@/lib/cutoff';

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

function generateDeliveryDates(): {
  value: string;
  label: string;
  day: string;
}[] {
  const today = new Date('2026-09-06T12:00:00');

  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today);

    date.setDate(date.getDate() + offset + 1);

    return {
      value: date.toISOString().slice(0, 10),
      label: String(date.getDate()),
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
        date.getDay()
      ],
    };
  });
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { products } = useFreshStore();

  const product = products.find((p) => p.id === id) ?? products[0];

  const [showBuyOnce, setShowBuyOnce] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>(['Morning']);
  const [showSuccess, setShowSuccess] = useState(false);

  const deliveryDates = generateDeliveryDates();

  const handleBuyOnceConfirm = () => {
    setShowBuyOnce(false);
    setShowSuccess(true);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Product Image */}
        <Image
          source={productImages[product.id] ?? productImages.cow}
          style={{ width: SCREEN_W, height: SCREEN_W, alignSelf: 'center' }}
          resizeMode="contain"
        />

        {/* Back Button */}
        <Pressable
          className="absolute left-5 top-[52px] ml-4 mt-2 h-9 w-9 items-center justify-center rounded-full bg-white"
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Text className="text-[24px] leading-[26px] text-[#111827]">
            <ArrowLeft size={24} color="#111827" />
          </Text>
        </Pressable>

        {/* Body */}
        <View className="mx-5 mt-4">
          {/* Product Name */}
          <Text className="text-[22px] font-extrabold text-[#111827]">
            {product.name}
          </Text>

          {/* Product Size */}
          <Text className="mt-1 text-[14px] text-[#64748B]">
            {product.size} · Fresh daily
          </Text>

          {/* Price */}
          <View className="mt-3 flex-row items-center gap-2">
            <Text className="text-[24px] font-extrabold text-[#111827]">
              ₹{product.price}
            </Text>

            <Text className="text-[16px] text-[#64748B] line-through">
              ₹{product.mrp}
            </Text>

            <View className="rounded-[8px] bg-[#DCFCE7] px-2 py-[3px]">
              <Text className="text-[11px] font-bold text-[#15803D]">
                Save ₹{product.mrp - product.price}
              </Text>
            </View>
          </View>

          <TrustBadgeRow />

          {/* About */}
          <Text className="mb-2 mt-[22px] text-[15px] font-extrabold text-[#111827]">
            About this product
          </Text>

          <Text className="text-[14px] leading-[22px] text-[#64748B]">
            {product.description}
          </Text>

          {/* Highlights */}
          <Text className="mb-2 mt-[22px] text-[15px] font-extrabold text-[#111827]">
            Highlights
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {product.tags.map((tag) => (
              <View
                key={tag}
                className="flex-row items-center gap-1 rounded-[10px] bg-[#F5F7FB] px-2 py-[6px]"
              >
                <Check size={11} color="#22C55E" />

                <Text className="text-[12px] font-semibold text-[#111827]">
                  {tag}
                </Text>
              </View>
            ))}
          </View>

          {/* Delivery Information */}
          <View className="mt-5 flex-row items-center gap-2 rounded-[12px] bg-[#EEF3FF] p-3">
            <Clock size={14} color="#1E4FFF" />

            <Text className="flex-1 text-[12px] font-semibold text-[#1E4FFF]">
              Order before 10 PM · Delivered by 7 AM,{' '}
              {formatDate(product.nextDeliveryDate)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 flex-row gap-2.5 border-t border-[#F1F5F9] bg-white px-5 py-[14px]">
        {/* Buy Once */}
        <Pressable
          className="flex-1 items-center rounded-[14px] border border-[#1E4FFF] py-3"
          onPress={() => setShowBuyOnce(true)}
        >
          <Text className="text-[14px] font-extrabold text-[#1E4FFF]">
            Buy Once
          </Text>

          <Text className="mt-[2px] text-[11px] text-[#1E4FFF]">
            ₹{product.price}
          </Text>
        </Pressable>

        {/* Subscribe */}
        <Pressable
          className="flex-[1.3] items-center rounded-[14px] bg-[#1E4FFF] py-3"
          onPress={() => router.push(`/subscribe/${product.id}`)}
        >
          <Text className="text-[14px] font-extrabold text-white">
            Subscribe
          </Text>

          <Text className="mt-[2px] text-[11px] text-[#DCE6FF]">
            From ₹{product.price}/delivery
          </Text>
        </Pressable>
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

            <Text className="text-[18px] font-extrabold text-[#111827]">
              Buy Once — Choose Date
            </Text>

            <Text className="mt-1 text-[13px] text-[#64748B]">
              {product.name} · {product.size} · ₹{product.price}
            </Text>

            {/* Date */}
            <Text className="mb-2.5 mt-5 text-[14px] font-extrabold text-[#111827]">
              Select delivery date
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {deliveryDates.map((dateItem) => {
                const active = selectedDate === dateItem.value;

                return (
                  <Pressable
                    key={dateItem.value}
                    className={
                      active
                        ? 'h-16 w-[60px] items-center justify-center rounded-[14px] bg-[#1E4FFF]'
                        : 'h-16 w-[60px] items-center justify-center rounded-[14px] bg-[#F5F7FB]'
                    }
                    onPress={() => setSelectedDate(dateItem.value)}
                  >
                    <Text
                      className={
                        active
                          ? 'text-[10px] font-bold text-[#DCE6FF]'
                          : 'text-[10px] font-bold text-[#64748B]'
                      }
                    >
                      {dateItem.day}
                    </Text>

                    <Text
                      className={
                        active
                          ? 'mt-[3px] text-[18px] font-extrabold text-white'
                          : 'mt-[3px] text-[18px] font-extrabold text-[#111827]'
                      }
                    >
                      {dateItem.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Time Slot */}
            <Text className="mb-2.5 mt-5 text-[14px] font-extrabold text-[#111827]">
              Preferred time slot
            </Text>

            <Text className="mb-2.5 mt-[-4px] text-[12px] text-[#64748B]">
              Select one or both delivery slots
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {['Morning', 'Evening'].map((slot) => {
                const isSelected = selectedSlots.includes(slot);

                return (
                  <Pressable
                    key={slot}
                    className={
                      isSelected
                        ? 'h-10 flex-row items-center gap-[5px] rounded-[14px] bg-[#1E4FFF] px-4'
                        : 'h-10 flex-row items-center gap-[5px] rounded-[14px] bg-[#F5F7FB] px-4'
                    }
                    onPress={() =>
                      setSelectedSlots((current) =>
                        isSelected
                          ? current.filter((item) => item !== slot)
                          : [...current, slot]
                      )
                    }
                  >
                    {isSelected && <Check size={12} color="#fff" />}

                    <Text
                      className={
                        isSelected
                          ? 'text-[13px] font-semibold text-white'
                          : 'text-[13px] font-semibold text-[#111827]'
                      }
                    >
                      {slot}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Summary */}
            <View className="mt-5 flex-row justify-between border-t border-[#F1F5F9] pt-4">
              <View>
                <Text className="text-[11px] text-[#64748B]">
                  Item
                </Text>

                <Text className="mt-[2px] text-[13px] font-bold text-[#111827]">
                  {product.name}
                </Text>
              </View>

              <View>
                <Text className="text-[11px] text-[#64748B]">
                  Delivery
                </Text>

                <Text className="mt-[2px] text-[13px] font-bold text-[#111827]">
                  {selectedDate
                    ? formatDate(selectedDate)
                    : 'Select date'}
                </Text>
              </View>

              <View>
                <Text className="text-[11px] text-[#64748B]">
                  Slot
                </Text>

                <Text className="mt-[2px] text-[13px] font-bold text-[#111827]">
                  {selectedSlots.length
                    ? selectedSlots.join(' + ')
                    : 'Select slot'}
                </Text>
              </View>

              <View>
                <Text className="text-[11px] text-[#64748B]">
                  Total
                </Text>

                <Text className="mt-[2px] text-[13px] font-bold text-[#111827]">
                  ₹{product.price}
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View className="mt-5 flex-row gap-2.5">
              <Pressable
                className="justify-center px-4"
                onPress={() => setShowBuyOnce(false)}
              >
                <Text className="text-[14px] font-semibold text-[#64748B] underline">
                  Cancel
                </Text>
              </Pressable>

              <View className="flex-1">
                <PrimaryButton
                  label="Confirm Order"
                  disabled={
                    !selectedDate || selectedSlots.length === 0
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

            <Text className="text-[18px] font-extrabold text-[#111827]">
              Order Placed!
            </Text>

            <Text className="mt-2 text-center text-[14px] leading-5 text-[#64748B]">
              Your {product.name} will be delivered on{' '}
              {selectedDate
                ? formatDate(selectedDate)
                : formatDate(product.nextDeliveryDate)}{' '}
              ({selectedSlots.join(' + ')}) in the selected slot.
            </Text>

            <Pressable
              className="mt-5 w-full items-center rounded-[14px] bg-[#1E4FFF] px-8 py-[14px]"
              onPress={() => {
                setShowSuccess(false);
                router.replace('/(tabs)/orders');
              }}
            >
              <Text className="text-[15px] font-bold text-white">
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
              <Text className="text-[14px] font-semibold text-[#1E4FFF]">
                Back to Home
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

