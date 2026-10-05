
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  MapPin,
  Pause,
  Repeat,
  SkipForward,
  Wallet,
} from 'lucide-react-native';
import {
  PrimaryButton,
  SectionTitle,
  StatusPill,
} from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/userSlice';
import { fetchProfile } from '@/store/slices/profileSlice';
import { fetchProducts } from '@/store/slices/productsSlice';
import { formatDate } from '@/lib/cutoff';

const allSubscriptions = [
  {
    id: 'sub-1',
    productId: 'buffalo',
    planTier: 'Family',
    frequency: 'Daily',
    timeSlot: 'Morning',
    status: 'Active',
    nextDeliveryDate: '2026-09-08',
    skippedDates: [] as string[],
  },
  {
    id: 'sub-2',
    productId: 'paneer',
    planTier: 'Starter',
    frequency: 'Weekly',
    timeSlot: 'Evening',
    status: 'Paused',
    nextDeliveryDate: '2026-09-15',
    skippedDates: [] as string[],
  },
  {
    id: 'sub-3',
    productId: 'ghee',
    planTier: 'Starter',
    frequency: 'Weekly',
    timeSlot: 'Morning',
    status: 'Active',
    nextDeliveryDate: '2026-09-10',
    skippedDates: ['2026-09-03'],
  },
];

export default function AccountScreen() {
  const dispatch = useAppDispatch();
  const { user, profile, walletBalance, products, productsStatus } = useFreshStore();
  const profileName = [profile.details.firstName, profile.details.lastName].filter(Boolean).join(' ') || user.name;

  const {isLoggingOut} = user;

  useEffect(() => {
    if (!profile.hasLoaded && !profile.isLoading && !profile.error) dispatch(fetchProfile());
  }, [dispatch, profile.error, profile.hasLoaded, profile.isLoading]);

  useEffect(() => {
    if (products.length === 0 && productsStatus === 'idle') dispatch(fetchProducts());
  }, [dispatch, products.length, productsStatus]);

  const handleLogout = async () => {
    try {
      const result = await dispatch(logout()).unwrap();
      router.replace('/onboarding');

      if (!result.serverLogoutSucceeded) {
        Alert.alert(
          'Signed out',
          'This device is signed out, but the server could not invalidate the session.'
        );
      }
    } catch {
      Alert.alert('Logout failed', 'Unable to clear the saved session. Please try again.');
    }
  };

  return (
    <View className="flex-1 bg-[#F7F9FC]">

      {/* Top Bar */}
      <View className="mb-2 px-5">
        <Text className="text-[22px] font-bold text-[#111827]">
          Account
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      >

        {/* Profile Card */}
        <View className="mb-4 flex-row items-center gap-[14px] rounded-[16px] border border-[#E2E8F0] bg-white p-[14px]">

          {/* Avatar */}
          <View className="h-12 w-12 items-center justify-center rounded-full bg-[#4a5373]">
            <Text className="text-[20px] font-bold  text-white">
              {profileName[0]}
            </Text>
          </View>

          {/* User Details */}
          <View className="flex-1">
            <Text className="text-[16px] font-bold text-[#7389b6]">
              {profileName}
            </Text>

            <Text className="mt-[2px] text-[13px] text-[#64748B]">
              {user.phone}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="mb-5 flex-row rounded-[16px] border border-[#E2E8F0] bg-white p-[14px]">

          {/* Active Subs */}
          <View className="flex-1 items-center">
            <Text className="text-[18px] font-bold text-[#111827]">
              {
                allSubscriptions.filter(
                  (subscription) => subscription.status === 'Active'
                ).length
              }
            </Text>

            <Text className="mt-[2px] text-[11px] text-[#64748B]">
              Active Subs
            </Text>
          </View>

          {/* Divider */}
          <View className="w-px bg-[#F1F5F9]" />

          {/* Wallet */}
          <View className="flex-1 items-center">
            <Text className="text-[18px] font-bold text-[#111827]">
              ₹{walletBalance}
            </Text>

            <Text className="mt-[2px] text-[11px] text-[#64748B]">
              Wallet
            </Text>
          </View>

          {/* Divider */}
          <View className="w-px bg-[#F1F5F9]" />

          {/* Orders */}
          <View className="flex-1 items-center">
            <Text className="text-[18px] font-bold text-[#111827]">
              4
            </Text>

            <Text className="mt-[2px] text-[11px] text-[#64748B]">
              Orders
            </Text>
          </View>
        </View>

        {/* My Subscriptions */}
        <SectionTitle
          title="My Subscriptions"
          action="Manage"
          onAction={() => router.push('/subscription')}
        />

        {/* Subscription Cards */}
        {allSubscriptions.map((sub) => {
          const product = products.find(
            (p) => p.id === sub.productId
          );

          return (
            <View
              key={sub.id}
              className="mb-3 rounded-[16px] border border-[#E2E8F0] bg-white p-[14px]"
            >

              {/* Subscription Header */}
              <View className="flex-row items-center justify-between">

                {/* Badge */}
                <View className="flex-row items-center gap-1 rounded-[10px] bg-[#023E8A] px-2 py-1">
                  <Repeat size={12} color="#fff" />

                  <Text className="text-[10px] font-bold text-white">
                    Subscription
                  </Text>
                </View>

                {/* Status */}
                <StatusPill label={sub.status} />
              </View>

              {/* Product */}
              <Text className="mt-[10px] text-[16px] font-bold text-[#111827]">
                {product?.name ?? 'Product details unavailable'}
              </Text>

              {/* Meta */}
              <Text className="mt-[3px] text-[13px] text-[#64748B]">
                {sub.planTier} · {sub.frequency} · {sub.timeSlot}
              </Text>

              {/* Subscription Information */}
              <View className="mt-3 flex-row gap-4 border-t border-[#F1F5F9] pt-3">

                {/* Next Delivery */}
                <View className="flex-row items-center gap-[5px]">
                  <Clock size={12} color="#64748B" />

                  <Text className="text-[12px] font-bold text-[#111827]">
                    Next: {formatDate(sub.nextDeliveryDate)}
                  </Text>
                </View>

                {/* Skipped */}
                <View className="flex-row items-center gap-[5px]">
                  <Calendar size={12} color="#64748B" />

                  <Text className="text-[12px] font-bold text-[#111827]">
                    {sub.skippedDates.length} skipped
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View className="mt-3 flex-row gap-2">

                {/* Manage */}
                <Pressable
                  className="flex-1 flex-row items-center justify-center gap-1.5 rounded-[10px] bg-[#F5F7FB] py-[10px]"
                  onPress={() => router.push('/subscription')}
                >
                  <View className="h-7 w-7 items-center justify-center rounded-[8px] bg-[#EEF3FF]">
                    <Calendar size={14} color="#023E8A" />
                  </View>

                  <Text className="text-[12px] font-bold text-[#111827]">
                    Manage
                  </Text>
                </Pressable>

                {/* Pause */}
                <Pressable
                  className="flex-1 flex-row items-center justify-center gap-1.5 rounded-[10px] bg-[#F5F7FB] py-[10px]"
                  onPress={() => router.push('/subscription/pause')}
                >
                  <View className="h-7 w-7 items-center justify-center rounded-[8px] bg-[#EEF3FF]">
                    <Pause size={14} color="#F59E0B" />
                  </View>

                  <Text className="text-[12px] font-bold text-[#111827]">
                    Pause
                  </Text>
                </Pressable>

                {/* Skip */}
                <Pressable
                  className="flex-1 flex-row items-center justify-center gap-1.5 rounded-[10px] bg-[#F5F7FB] py-[10px]"
                  onPress={() => router.push('/subscription/skip')}
                >
                  <View className="h-7 w-7 items-center justify-center rounded-[8px] bg-[#EEF3FF]">
                    <SkipForward size={14} color="#023E8A" />
                  </View>

                  <Text className="text-[12px] font-bold text-[#111827]">
                    Skip
                  </Text>
                </Pressable>
              </View>

              {/* Cancel */}
              {sub.status === 'Active' ||
              sub.status === 'Paused' ? (
                <Pressable
                  className="mt-2 items-center py-[10px]"
                  onPress={() =>
                    router.push('/subscription/cancel')
                  }
                >
                  <Text className="text-[13px] font-bold text-[#EF4444] underline">
                    Cancel Subscription
                  </Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}

        {/* Account Settings */}
        <SectionTitle title="Account Settings" />

        {/* Delivery Addresses */}
        <Pressable
          className="mb-[10px] flex-row items-center justify-between rounded-[14px] border border-[#E2E8F0] bg-white p-[14px]"
          onPress={() => router.push('/addresses')}
        >
          <View className="flex-row items-center gap-3">
            <MapPin size={20} color="#023E8A" />

            <Text className="text-[14px] font-bold text-[#111827]">
              Delivery Addresses
            </Text>
          </View>

          <ChevronRight size={18} color="#64748B" />
        </Pressable>

        {/* Payment Methods */}
        <Pressable
          className="mb-[10px] flex-row items-center justify-between rounded-[14px] border border-[#E2E8F0] bg-white p-[14px]"
          onPress={() => router.push('/payment')}
        >
          <View className="flex-row items-center gap-3">
            <CreditCard size={20} color="#023E8A" />

            <Text className="text-[14px] font-bold text-[#111827]">
              Payment Methods
            </Text>
          </View>

          <ChevronRight size={18} color="#64748B" />
        </Pressable>

        {/* Wallet */}
        <Pressable
          className="mb-[10px] flex-row items-center justify-between rounded-[14px] border border-[#E2E8F0] bg-white p-[14px]"
          onPress={() => router.push('/wallet')}
        >
          <View className="flex-row items-center gap-3">
            <Wallet size={20} color="#023E8A" />

            <Text className="text-[14px] font-bold text-[#111827]">
              Wallet
            </Text>
          </View>

          <ChevronRight size={18} color="#64748B" />
        </Pressable>

        {/* Notifications */}
        <Pressable
          className="mb-[10px] flex-row items-center justify-between rounded-[14px] border border-[#E2E8F0] bg-white p-[14px]"
          onPress={() => router.push('/notifications')}
        >
          <View className="flex-row items-center gap-3">
            <Bell size={20} color="#023E8A" />

            <Text className="text-[14px] font-bold text-[#111827]">
              Notifications
            </Text>
          </View>

          <ChevronRight size={18} color="#64748B" />
        </Pressable>

        {/* Order History */}
        <Pressable
          className="mb-[10px] flex-row items-center justify-between rounded-[14px] border border-[#E2E8F0] bg-white p-[14px]"
          onPress={() => router.push('/(tabs)/orders')}
        >
          <View className="flex-row items-center gap-3">
            <Calendar size={20} color="#023E8A" />

            <Text className="text-[14px] font-bold text-[#111827]">
              Order History
            </Text>
          </View>

          <ChevronRight size={18} color="#64748B" />
        </Pressable>

        {/* Logout */}
        <View className="mt-6">
          <PrimaryButton
            label={isLoggingOut ? 'Logging Out...' : 'Log Out'}
            onPress={handleLogout}
            disabled={isLoggingOut}
          />
        </View>

        {/* Version */}
        <Text className="mt-5 text-center text-[11px] text-[#64748B]">
          Dinesh Farms v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

