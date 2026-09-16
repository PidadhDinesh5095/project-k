
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ArrowLeft, Check, CreditCard, Plus } from 'lucide-react-native';
import { colors, SectionTitle } from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';

export default function PaymentScreen() {
  const { user } = useFreshStore();

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
          Payment Methods
        </Text>

        <SectionTitle title="Saved Methods" />

        {user.paymentMethods.map((m, i) => (
          <View
            key={m}
            className="mb-2.5 flex-row items-center gap-3 rounded-[14px] border border-[#E2E8F0] bg-white p-[14px]"
          >
            <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#EEF3FF]">
              <CreditCard
                size={18}
                color={colors.primary}
              />
            </View>

            <Text className="flex-1 text-[14px] font-bold text-[#111827]">
              {m}
            </Text>

            {i === 0 && (
              <View className="flex-row items-center gap-[3px] rounded-lg bg-[#1E4FFF] px-1.5 py-[3px]">
                <Check size={10} color="#fff" />

                <Text className="text-[10px] font-bold text-white">
                  Default
                </Text>
              </View>
            )}
          </View>
        ))}

        <Pressable className="mt-1 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1E4FFF] p-[18px]">
          <Plus size={18} color={colors.primary} />

          <Text className="text-[14px] font-bold text-[#1E4FFF]">
            Add Payment Method
          </Text>
        </Pressable>

        <Text className="mt-5 text-center text-[12px] text-[#64748B]">
          Your payment info is encrypted and secure.
        </Text>
      </ScrollView>
    </View>
  );
}
