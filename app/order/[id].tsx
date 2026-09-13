
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import {
  colors,
  PrimaryButton,
  StatusPill,
} from '@/components/FreshComponents';
import { useAppSelector } from '@/store/hooks';
import { formatDate } from '@/lib/cutoff';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const orders = useAppSelector((state) => state.orders.items);
  const order = orders.find((o) => o.id === id) ?? orders[0];

  return (
    <View className="flex-1 bg-[#F7F9FC] pt-[52px]">

      {/* Back Button */}
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
        {/* Order Header */}
        <View className="mt-3 mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-[18px] font-extrabold text-[#111827]">
              {order.id}
            </Text>

            <Text className="mt-[2px] text-[13px] text-[#64748B]">
              {formatDate(order.date)}
            </Text>
          </View>

          <StatusPill label={order.status} />
        </View>

        {/* Items */}
        <Text className="mt-5 mb-[10px] text-[15px] font-extrabold text-[#111827]">
          Items
        </Text>

        <View className="rounded-[16px] border border-[#E2E8F0] bg-white p-[14px]">
          {order.items.map((item, i) => (
            <View
              key={i}
              className="flex-row items-center gap-3 py-2"
            >
              {/* Item Thumbnail */}
              <View className="h-11 w-11 items-center justify-center rounded-[10px] bg-[#E8EDF5]">
                <Text className="text-[9px] font-extrabold text-[#94A3B8]">
                  MILK
                </Text>
              </View>

              {/* Item Details */}
              <View className="flex-1">
                <Text className="text-[14px] font-semibold text-[#111827]">
                  {item.name}
                </Text>

                <Text className="mt-[2px] text-[12px] text-[#64748B]">
                  Qty: {item.quantity}
                </Text>
              </View>

              {/* Price */}
              <Text className="text-[14px] font-bold text-[#111827]">
                ₹{item.price}
              </Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <Text className="mt-5 mb-[10px] text-[15px] font-extrabold text-[#111827]">
          Delivery Address
        </Text>

        <View className="rounded-[16px] border border-[#E2E8F0] bg-white p-[14px]">
          <View className="flex-row items-center gap-[10px]">
            <MapPin size={16} color={colors.primary} />

            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-[#111827]">
                {order.deliveryAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <Text className="mt-5 mb-[10px] text-[15px] font-extrabold text-[#111827]">
          Payment Summary
        </Text>

        <View className="rounded-[16px] border border-[#E2E8F0] bg-white p-[14px]">

          {/* Item Total */}
          <View className="flex-row justify-between py-[6px]">
            <Text className="text-[14px] text-[#64748B]">
              Item total
            </Text>

            <Text className="text-[14px] font-semibold text-[#111827]">
              ₹{order.itemTotal}
            </Text>
          </View>

          {/* Delivery Fee */}
          <View className="flex-row justify-between py-[6px]">
            <Text className="text-[14px] text-[#64748B]">
              Delivery fee
            </Text>

            <Text className="text-[14px] font-semibold text-[#111827]">
              {order.deliveryFee === 0
                ? 'FREE'
                : `₹${order.deliveryFee}`}
            </Text>
          </View>

          {/* Wallet Used */}
          {order.walletUsed > 0 && (
            <View className="flex-row justify-between py-[6px]">
              <Text className="text-[14px] text-[#64748B]">
                Wallet used
              </Text>

              <Text className="text-[14px] font-semibold text-[#111827]">
                -₹{order.walletUsed}
              </Text>
            </View>
          )}

          {/* Divider */}
          <View className="my-[6px] h-px bg-[#F1F5F9]" />

          {/* Total */}
          <View className="flex-row justify-between py-[6px]">
            <Text className="text-[15px] font-extrabold text-[#111827]">
              Total Paid
            </Text>

            <Text className="text-[15px] font-extrabold text-[#111827]">
              ₹{order.totalPaid}
            </Text>
          </View>
        </View>

        {/* Download Invoice */}
        {order.status === 'Delivered' && (
          <View className="mt-6">
            <PrimaryButton
              label="Download Invoice"
              onPress={() =>
                router.push(`/invoice/${order.id}`)
              }
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
