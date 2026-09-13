
import { router } from 'expo-router';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  Bell,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Repeat,
} from 'lucide-react-native';
import {
  colors,
  PrimaryButton,
  SectionTitle,
  StatusPill,
  TrustBadgeRow,
  WalletChip,
} from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';
import { formatDate } from '@/lib/cutoff';

const bannerImages = [
  'https://images.pexels.com/photos/15835848/pexels-photo-15835848.jpeg?auto=compress&cs=tinysrgb&h=350&w=600',
  'https://images.pexels.com/photos/19025067/pexels-photo-19025067.jpeg?auto=compress&cs=tinysrgb&h=350&w=600',
  'https://images.pexels.com/photos/13978261/pexels-photo-13978261.jpeg?auto=compress&cs=tinysrgb&h=350&w=600',
  'https://images.pexels.com/photos/15835856/pexels-photo-15835856.jpeg?auto=compress&cs=tinysrgb&h=350&w=600',
];

const productImages: Record<string, string> = {
  buffalo:
    'https://images.pexels.com/photos/5967316/pexels-photo-5967316.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  cow:
    'https://images.pexels.com/photos/36183642/pexels-photo-36183642.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  cream:
    'https://images.pexels.com/photos/15835848/pexels-photo-15835848.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  paneer:
    'https://images.pexels.com/photos/7368028/pexels-photo-7368028.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  ghee:
    'https://images.pexels.com/photos/38883078/pexels-photo-38883078.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  curd:
    'https://images.pexels.com/photos/28664618/pexels-photo-28664618.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  oat:
    'https://images.pexels.com/photos/6820268/pexels-photo-6820268.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  almond:
    'https://images.pexels.com/photos/1344035/pexels-photo-1344035.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  coconut:
    'https://images.pexels.com/photos/8472813/pexels-photo-8472813.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
};

export default function HomeScreen() {
  const {
    user,
    walletBalance,
    subscription,
    products,
  } = useFreshStore();

  const product = products.find(
    (p) => p.id === subscription.productId
  )!;

  return (
    <View className="flex-1 bg-[#F7F9FC]">

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >

        {/* ==================== TOP BAR ==================== */}

        <View className="flex-row items-start justify-between px-5 pb-2 pt-[52px]">

          {/* Greeting + Location */}
          <View>
            <Text className="text-[18px] font-medium font-sans text-[#111827]">
              Good Afternoon, {user.name}
            </Text>

            <View className="mt-[3px] flex-row items-center gap-[3px]">
              <MapPin
                size={12}
                color="#64748B"
              />

              <Text className="text-[11px] text-[#64748B]">
                Deliver to: Home · {user.addresses[0].city}
              </Text>
            </View>
          </View>

          {/* Wallet + Notification */}
          <View className="flex-row items-center gap-[10px]">

            <WalletChip
              balance={walletBalance}
              onPress={() => router.push('/wallet')}
            />

            <Pressable
              onPress={() => router.push('/notifications')}
              hitSlop={10}
            >
              <Bell
                size={20}
                color="#111827"
              />
            </Pressable>

          </View>
        </View>


        {/* ==================== HERO ==================== */}

        <View className="mx-5 mt-3 rounded-[20px] bg-[#1E4FFF] p-5">

          <Text className="text-[20px] font-extrabold text-white">
            Fresh, Pure & Delivered Daily
          </Text>

          <Text className="mb-4 mt-[6px] text-[13px] leading-[19px] text-[#DCE6FF]">
            Farm-fresh milk, paneer & more — at your door by 7 AM.
          </Text>

          <PrimaryButton
            label="Shop Now"
            onPress={() => router.push('/products')}
          />

        </View>


        {/* ==================== BANNER CAROUSEL ==================== */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            gap: 12,
          }}
          className="mt-4"
        >
          {bannerImages.map((uri, i) => (
            <Image
              key={i}
              source={{ uri }}
              className="h-40 w-[280px] rounded-[16px]"
            />
          ))}
        </ScrollView>


        {/* ==================== BODY ==================== */}

        <View className="mt-1 px-5">

          {/* Trust Badges */}
          <TrustBadgeRow />


          {/* ==================== SUBSCRIPTION CARD ==================== */}

          <View className="mt-1 rounded-[16px] border border-[#E2E8F0] bg-white p-[14px]">

            {/* Top */}
            <View className="flex-row items-center justify-between">

              <View className="flex-row items-center gap-1 rounded-[10px] bg-[#1E4FFF] px-2 py-1">

                <Repeat
                  size={12}
                  color="#fff"
                />

                <Text className="text-[10px] font-bold text-white">
                  Active Subscription
                </Text>

              </View>

              <StatusPill label={subscription.status} />

            </View>


            {/* Product */}
            <Text className="mt-[10px] text-[16px] font-extrabold text-[#111827]">
              {product.name}
            </Text>

            <Text className="mt-[3px] text-[12px] text-[#64748B]">
              {subscription.quantityPerDelivery} × {product.size} ·{' '}
              {subscription.frequency} · {subscription.timeSlot}
            </Text>


            {/* Bottom Info */}
            <View className="mt-3 flex-row items-center justify-between border-t border-[#F1F5F9] pt-3">

              <View className="flex-row items-center gap-1">

                <Clock
                  size={12}
                  color="#64748B"
                />

                <Text className="text-[12px] font-semibold text-[#111827]">
                  Next: {formatDate(subscription.nextDeliveryDate)}
                </Text>

              </View>

              <Pressable
                onPress={() => router.push('/subscription')}
              >
                <Text className="text-[12px] font-bold text-[#1E4FFF]">
                  Manage →
                </Text>
              </Pressable>

            </View>

          </View>


          {/* ==================== FRESH PICKS ==================== */}

          <SectionTitle
            title="Fresh Picks"
            action="See all"
            onAction={() => router.push('/products')}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 12,
            }}
            className="mt-1"
          >

            {products.slice(0, 6).map((p) => (
              <Pressable
                key={p.id}
                className="w-[130px] items-center rounded-[14px] border border-[#E2E8F0] bg-white p-[10px]"
                onPress={() => router.push(`/product/${p.id}`)}
              >

                <Image
                  source={{
                    uri:
                      productImages[p.id] ??
                      productImages.cow,
                  }}
                  className="h-[110px] w-[110px] rounded-[12px]"
                />

                <Text
                  className="mt-2 text-[13px] font-bold text-[#111827]"
                  numberOfLines={1}
                >
                  {p.name}
                </Text>

                <Text className="mt-1 text-[14px] font-extrabold text-[#1E4FFF]">
                  ₹{p.price}
                </Text>

              </Pressable>
            ))}

          </ScrollView>


          {/* ==================== POPULAR PRODUCTS ==================== */}

          <SectionTitle
            title="Popular Products"
            action="See all"
            onAction={() => router.push('/products')}
          />

          {products.slice(0, 3).map((p) => (
            <Pressable
              key={p.id}
              className="mb-3 flex-row items-center gap-3 rounded-[16px] border border-[#E2E8F0] bg-white p-3"
              onPress={() => router.push(`/product/${p.id}`)}
            >

              {/* Product Image */}
              <Image
                source={{
                  uri:
                    productImages[p.id] ??
                    productImages.cow,
                }}
                className="h-16 w-16 rounded-[12px]"
              />

              {/* Product Details */}
              <View className="flex-1">

                <Text className="text-[15px] font-bold text-[#111827]">
                  {p.name}
                </Text>

                <Text className="mt-[3px] text-[12px] text-[#64748B]">
                  {p.size} · Fresh daily
                </Text>

                <View className="mt-[6px] flex-row items-center gap-[6px]">

                  <Text className="text-[15px] font-extrabold text-[#111827]">
                    ₹{p.price}
                  </Text>

                  <Text className="text-[12px] text-[#64748B] line-through">
                    ₹{p.mrp}
                  </Text>

                </View>

              </View>

              <ChevronRight
                size={18}
                color="#64748B"
              />

            </Pressable>
          ))}


          {/* ==================== VIEW ALL ==================== */}

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


      {/* ==================== FAB ==================== */}

      <Pressable
        className="absolute bottom-20 right-5 h-[54px] w-[54px] items-center justify-center rounded-full bg-[#1E4FFF]"
        onPress={() => router.push('/products')}
      >
        <Plus
          size={22}
          color="#fff"
        />
      </Pressable>

    </View>
  );
}

