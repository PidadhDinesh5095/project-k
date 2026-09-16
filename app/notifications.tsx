
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { ArrowLeft, Bell, Trash2 } from 'lucide-react-native';
import { colors, EmptyState } from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';

const typeIcon: Record<string, string> = {
  delivery: '🚚',
  wallet: '▣',
  promo: '🎁',
  skip: '⏭',
  renewal: '↻',
};

export default function NotificationsScreen() {
  const {
    notifications,
    clearNotifications,
    markNotificationRead,
  } = useFreshStore();

  const [confirm, setConfirm] = useState(false);

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

      <View className="mb-4 mt-2 flex-row items-center justify-between px-5">
        <Text className="text-[22px] font-extrabold text-[#111827]">
          Notifications
        </Text>

        {notifications.length > 0 && (
          <Pressable onPress={() => setConfirm(true)}>
            <Trash2 size={18} color={colors.red} />
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      >
        {notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No notifications"
            body="Updates about deliveries, wallet credits and offers will show up here."
          />
        ) : (
          notifications.map((n) => (
            <Pressable
              key={n.id}
              className={`mb-2.5 flex-row items-start gap-3 rounded-[14px] border p-[14px] ${
                n.isRead
                  ? 'border-[#E2E8F0] bg-white'
                  : 'border-[#1E4FFF] bg-[#F5F8FF]'
              }`}
              onPress={() => markNotificationRead(n.id)}
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3FF]">
                <Text className="text-[18px]">
                  {typeIcon[n.type] ?? '🔔'}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-[14px] font-bold text-[#111827]">
                  {n.title}
                </Text>

                <Text className="mt-1 text-[13px] leading-[19px] text-[#64748B]">
                  {n.body}
                </Text>

                <Text className="mt-1.5 text-[11px] text-[#64748B]">
                  {n.timestamp}
                </Text>
              </View>

              {!n.isRead && (
                <View className="mt-1.5 h-2 w-2 rounded-full bg-[#1E4FFF]" />
              )}
            </Pressable>
          ))
        )}
      </ScrollView>

      {confirm && (
        <Pressable
          className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center bg-black/40 px-10"
          onPress={() => setConfirm(false)}
        >
          <View className="w-full rounded-[20px] bg-white p-6">
            <View className="mb-3.5 h-11 w-11 self-center items-center justify-center rounded-full bg-[#FEE2E2]">
              <Trash2 size={20} color={colors.red} />
            </View>

            <Text className="text-center text-[17px] font-extrabold text-[#111827]">
              Clear all notifications?
            </Text>

            <Text className="mt-2 text-center text-[13px] leading-[19px] text-[#64748B]">
              This will remove all notifications. You can't undo this action.
            </Text>

            <View className="mt-5 flex-row gap-2.5">
              <Pressable
                className="flex-1 items-center rounded-[14px] border border-[#E2E8F0] py-3"
                onPress={() => setConfirm(false)}
              >
                <Text className="text-[14px] font-bold text-[#111827]">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                className="flex-1 items-center rounded-[14px] bg-[#EF4444] py-3"
                onPress={() => {
                  clearNotifications();
                  setConfirm(false);
                }}
              >
                <Text className="text-[14px] font-bold text-white">
                  Clear All
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      )}
    </View>
  );
}
