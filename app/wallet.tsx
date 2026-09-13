
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
} from 'lucide-react-native';
import {
  colors,
  PrimaryButton,
  SectionTitle,
} from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';

const quickAmounts = [100, 200, 500, 1000];

export default function WalletScreen() {
  const {
    walletBalance,
    transactions,
    addWalletMoney,
  } = useFreshStore();

  const [selected, setSelected] = useState(200);

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
          My Wallet
        </Text>

        <View className="rounded-[20px] bg-[#1E4FFF] p-5">
          <View className="flex-row items-center gap-2">
            <Wallet size={18} color="#fff" />

            <Text className="text-[13px] font-semibold text-[#DCE6FF]">
              Available Balance
            </Text>
          </View>

          <Text className="mt-2 text-[34px] font-extrabold text-white">
            ₹{walletBalance.toFixed(2)}
          </Text>

          <Text className="mt-2 text-[12px] text-[#DCE6FF]">
            Use wallet for faster checkout & cashback rewards
          </Text>
        </View>

        <Text className="mb-2.5 mt-6 text-[15px] font-extrabold text-[#111827]">
          Add Money
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {quickAmounts.map((amt) => (
            <Pressable
              key={amt}
              className={`min-w-[70px] flex-1 items-center rounded-[14px] border bg-white py-3.5 ${
                selected === amt
                  ? 'border-[#1E4FFF] bg-[#EEF3FF]'
                  : 'border-[#E2E8F0]'
              }`}
              onPress={() => setSelected(amt)}
            >
              <Text
                className={`text-[15px] font-bold ${
                  selected === amt
                    ? 'text-[#1E4FFF]'
                    : 'text-[#111827]'
                }`}
              >
                ₹{amt}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-5">
          <PrimaryButton
            label={`Add ₹${selected} to Wallet`}
            onPress={() => addWalletMoney(selected)}
          />
        </View>

        <View className="mt-5 rounded-[14px] bg-[#DCFCE7] p-3.5">
          <Text className="text-[13px] font-bold text-[#15803D]">
            Earn ₹50 cashback on every 5th order!
          </Text>
        </View>

        <SectionTitle title="Transaction History" />

        {transactions.map((t) => (
          <View
            key={t.id}
            className="mb-2.5 flex-row items-center gap-3 rounded-[14px] border border-[#E2E8F0] bg-white p-[14px]"
          >
            <View
              className={`h-9 w-9 items-center justify-center rounded-[10px] ${
                t.direction === 'credit'
                  ? 'bg-[#DCFCE7]'
                  : 'bg-[#FEE2E2]'
              }`}
            >
              {t.direction === 'credit' ? (
                <ArrowDownLeft
                  size={16}
                  color={colors.green}
                />
              ) : (
                <ArrowUpRight
                  size={16}
                  color={colors.red}
                />
              )}
            </View>

            <View className="flex-1">
              <Text className="text-[14px] font-bold text-[#111827]">
                {t.title}
              </Text>

              <Text className="mt-0.5 text-[12px] text-[#64748B]">
                {t.timestamp}
              </Text>
            </View>

            <Text
              className={`text-[14px] font-extrabold ${
                t.direction === 'credit'
                  ? 'text-[#22C55E]'
                  : 'text-[#EF4444]'
              }`}
            >
              {t.direction === 'credit' ? '+' : '-'}₹{t.amount}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}