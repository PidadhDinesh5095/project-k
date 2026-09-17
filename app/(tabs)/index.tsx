import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Pause,
  Plus,
  Wallet,
} from 'lucide-react-native';
import { SectionTitle } from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const HEADER_HEIGHT = SCREEN_H * 0.1;

const BANNER_H_PADDING = 20;
const BANNER_WIDTH = SCREEN_W - BANNER_H_PADDING * 2;
const BANNER_HEIGHT = BANNER_WIDTH * 1.15;
const AUTO_SCROLL_MS = 5000;

const LOGO_URI = require('@/assets/images/logo_nbg.png');


const bannerImages = [
  { image: require('@/assets/images/home-1.png') },
  { image: require('@/assets/images/home-2.png') },
  { image: require('@/assets/images/home-3.png') },
  { image: require('@/assets/images/home-4.png') },
  { image: require('@/assets/images/home-5.png') },
  { image: require('@/assets/images/home-6.png') },
  { image: require('@/assets/images/home-7.png') },
];

const productImages: Record<string, string> = {
  buffalo:
    'https://images.pexels.com/photos/5967316/pexels-photo-5967316.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  cow:
    'https://images.pexels.com/photos/36183642/pexels-photo-36183642.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  cream:
    'https://images.pexels.com/photos/15835848/pexels-photo-15835848.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  paneer:
    'https://images.pexels.com/photos/7368028/pexels-photo-7368028.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  ghee:
    'https://images.pexels.com/photos/38883078/pexels-photo-38883078.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  curd:
    'https://images.pexels.com/photos/28664618/pexels-photo-28664618.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  oat:
    'https://images.pexels.com/photos/6820268/pexels-photo-6820268.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  almond:
    'https://images.pexels.com/photos/1344035/pexels-photo-1344035.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  coconut:
    'https://images.pexels.com/photos/8472813/pexels-photo-8472813.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
};

function getGreeting(date: Date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';

  return 'Good Evening';
}

function formatDisplayDate(date: Date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return 'Today';
  }

  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function isSameDate(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export default function HomeScreen() {
  const {
    user,
    walletBalance,
    subscription,
    products,
  } = useFreshStore();

  const product = products.find(
    (p) => p.id === subscription.productId
  );

  const greeting = useMemo(() => getGreeting(), []);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const changeDate = (days: number) => {
    setSelectedDate((currentDate) => {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + days);
      nextDate.setHours(0, 0, 0, 0);
      return nextDate;
    });
  };

  const hasDeliveryOnSelectedDate = useMemo(() => {
    if (!subscription.nextDeliveryDate) {
      return false;
    }

    const nextDelivery = new Date(subscription.nextDeliveryDate);

    if (Number.isNaN(nextDelivery.getTime())) {
      return false;
    }

    return isSameDate(nextDelivery, selectedDate);
  }, [subscription.nextDeliveryDate, selectedDate]);

  const isToday = isSameDate(selectedDate, today);

  const bannerScroll = useRef<ScrollView>(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerIndex = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex =
        (bannerIndex.current + 1) % bannerImages.length;

      bannerIndex.current = nextIndex;
      setActiveBanner(nextIndex);

      bannerScroll.current?.scrollTo({
        x: nextIndex * SCREEN_W,
        animated: nextIndex !== 0,
      });
    }, AUTO_SCROLL_MS);

    return () => clearInterval(interval);
  }, []);

  const handleBannerMomentumEnd = (e: any) => {
    const idx = Math.round(
      e.nativeEvent.contentOffset.x / SCREEN_W
    );

    bannerIndex.current = idx;
    setActiveBanner(idx);
  };

  const safeWalletBalance =
    typeof walletBalance === 'number'
      ? walletBalance
      : Number(walletBalance) || 0;

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >

        <View className="w-full ">

          <SafeAreaView edges={['top']}>
            <View className="flex-row items-center justify-between px-5 pb-5">

              <Image
                source={LOGO_URI}

                className="h-11 w-11 "
                resizeMode="contain"
              />

              <View className="flex-1 items-center ">
                <Text
                  className="font-sans text-[18px] font-extrabold "
                  numberOfLines={1}
                >
                  {greeting}, {user.name}!
                </Text>

                <Text
                  className="mt-[2px] text-[11px] text-[#32323366]"
                  numberOfLines={1}
                >
                  {user.addresses?.[0]?.line1 ??
                    user.addresses?.[0]?.city ??
                    ''}
                </Text>
              </View>

              <View className="w-8 items-end pr-2">
                <Pressable
                  onPress={() => router.push('/notifications')}
                  hitSlop={10}
                >
                  <Bell
                    size={25}
                    color="#000000"
                  />
                </Pressable>
              </View>

            </View>
          </SafeAreaView>

          <View className="px-5 pb-5">
            <View className="rounded-[18px] bg-[#EEF3FF] pt-5">

              <View className="mt-3 flex-row items-center justify-between">

                <View className="h-[36px] w-[36px] pl-8 items-center justify-center">
                  <Pressable
                    onPress={() => changeDate(-1)}
                    className="h-[36px] w-[36px] items-center justify-center rounded-full bg-[#2563EB]"
                    hitSlop={8}
                  >
                    <ChevronLeft
                      size={19}
                      color="#ffffff"
                    />
                  </Pressable>
                </View>

                <View className="flex-1 items-center px-3">

                  <Text className="text-[16px] font-bold text-[#111827]">
                    {isToday
                      ? 'Today'
                      : formatDisplayDate(selectedDate)}
                  </Text>

                  <Text className="mt-[2px] text-[11px] text-[#94A3B8]">
                    Update by 10:00 PM
                  </Text>

                </View>

                <View className="h-[36px] w-[36px] pr-8 items-center justify-center">
                  <Pressable
                    onPress={() => changeDate(1)}
                    className="h-[36px] w-[36px] items-center justify-center rounded-full bg-[#2563EB]"
                    hitSlop={8}
                  >
                    <ChevronRight
                      size={19}
                      color="#ffffff"
                    />
                  </Pressable>
                </View>

              </View>

              <Text className="mt-4 text-center text-[13px] text-[#94A3B8]">
                {hasDeliveryOnSelectedDate && product
                  ? `${product.name} · ${subscription.timeSlot}`
                  : 'No Scheduled deliveries'}
              </Text>

              <View className="mt-4 h-[54px] flex-row overflow-hidden border-t border-[#DCE5FF]">

                <Pressable
                  className="flex-1 flex-row items-center rounded-bl-full justify-center bg-[#EEF3FF]"
                >
                  <View className="h-[45%] w-[13%] items-center justify-center ">
                    <Pause
                      size={15}
                      color="#1E4FFF"
                      strokeWidth={2.5}
                    />
                  </View>

                  <Text className="ml-3 text-[17px] font-medium text-[#1E4FFF]">
                    Pause Orders
                  </Text>
                </Pressable>

                <View className="w-[1px] bg-[#DCE5FF]" />

                <Pressable
                  className="flex-1 flex-row items-center justify-center rounded-br-full bg-[#EEF3FF]"
                  onPress={() => router.push('/products')}
                >
                  <Plus
                    size={24}
                    color="#111827"
                    strokeWidth={2}
                  />

                  <Text className="ml-3 text-[17px] font-medium text-[#111827]">
                    Add Items
                  </Text>
                </Pressable>

              </View>

            </View>

          </View>

        </View>

        <View className="mt-1">

          <ScrollView
            ref={bannerScroll}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleBannerMomentumEnd}
            scrollEventThrottle={16}
          >
            {bannerImages.map((banner, i) => (
              <View
                key={i}
                style={{ width: SCREEN_W }}
                className="items-center justify-center px-5"
              >
                <Image
                  source={banner.image}
                  style={{
                    width: BANNER_WIDTH,
                    height: BANNER_HEIGHT,
                  }}
                  className="rounded-[24px]"
                />
              </View>
            ))}
          </ScrollView>

          <View className="mt-3 flex-row items-center justify-center gap-[6px]">
            {bannerImages.map((_, i) => (
              <View
                key={i}
                className={
                  i === activeBanner
                    ? 'h-[4px] w-[18px] rounded-full bg-[#1E4FFF]'
                    : 'h-[4px] w-[8px] rounded-full bg-[#CBD5E1]'
                }
              />
            ))}
          </View>

        </View>

        <View className="bg-white px-5 pt-5">

          <SectionTitle
            title="Fresh Picks"
            action="See all"
            onAction={() => router.push('/products')}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
            className="mt-1"
          >
            {products.slice(0, 6).map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/product/${p.id}`)}
              >
                <Image
                  source={{
                    uri:
                      productImages[p.id] ??
                      productImages.cow,
                  }}
                  className="h-[110px] w-[110px] rounded-[16px]"
                />
              </Pressable>
            ))}
          </ScrollView>

          <SectionTitle
            title="Popular Products"
            action="See all"
            onAction={() => router.push('/products')}
          />

          <View className="mt-1 flex-row flex-wrap justify-between">

            {products.slice(0, 6).map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/product/${p.id}`)}
                style={{ width: '48%' }}
                className="mb-4 rounded-[16px] border border-[#E2E8F0] bg-white p-[10px]"
              >
                <Image
                  source={{
                    uri:
                      productImages[p.id] ??
                      productImages.cow,
                  }}
                  className="h-[120px] w-full rounded-[12px]"
                />

                <Text
                  className="mt-2 text-[14px] font-bold text-[#111827]"
                  numberOfLines={1}
                >
                  {p.name}
                </Text>

                <Text
                  className="mt-[2px] text-[12px] text-[#64748B]"
                  numberOfLines={2}
                >
                  {p.description ??
                    `${p.size} · Fresh daily`}
                </Text>

              </Pressable>
            ))}

          </View>

          <Pressable
            className="mt-1 flex-row items-center justify-between rounded-[14px] border border-[#E2E8F0] bg-white p-[14px]"
            onPress={() => router.push('/products')}
          >
            <Text className="text-[14px] font-bold text-[#1E4FFF]">
              View all products
            </Text>

            <ChevronRight
              size={16}
              color="#1E4FFF"
            />
          </Pressable>

        </View>

      </ScrollView>

      <Pressable
        className="absolute bottom-20 right-5 h-[54px] w-[54px] items-center justify-center rounded-full bg-[#1E4FFF]"
        onPress={() => router.push('/products')}
      >
        <Plus
          size={22}
          color="#FFFFFF"
        />
      </Pressable>

    </View>
  );
}