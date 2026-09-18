
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { colors, ProductCard, TrustBadgeRow, WalletChip } from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';
import { Product } from '@/types/fresh';

const dairySidebar: Array<{ label: string; key: string; image: number | null }> = [
  { label: 'All', key: 'All', image: null },
  { label: 'Milk', key: 'Milk', image: require('@/assets/images/products/CowMilk-removebg-preview.png') },
  { label: 'Daily Pro+', key: 'Daily Pro+', image: require('@/assets/images/products/A2BufalloMilk-removebg-preview.png') },
  { label: 'Curd & Paneer', key: 'Curd & Paneer', image: require('@/assets/images/products/CowCurd-removebg-preview.png') },
  { label: 'Ghee', key: 'Ghee', image: require('@/assets/images/products/buffaloghee-removebg-preview.png') },
];

const nonDairyCategories = ['All', 'Oat Milk', 'Almond Milk', 'Coconut Milk'];

const nonDairyProducts: Product[] = [
  {
    id: 'oat',
    name: 'Oat Milk',
    size: '1 L',
    category: 'Oat Milk',
    price: 180,
    mrp: 210,
    tags: ['Plant Based', 'No Added Sugar'],
    description: 'Smooth, creamy oat milk for everyday sipping.',
    nextDeliveryDate: '2026-09-08',
    imageLabel: 'OAT',
  },
  {
    id: 'almond',
    name: 'Almond Milk',
    size: '1 L',
    category: 'Almond Milk',
    price: 220,
    mrp: 250,
    tags: ['Plant Based', 'Rich in Calcium'],
    description: 'Light almond milk made with premium almonds.',
    nextDeliveryDate: '2026-09-08',
    imageLabel: 'ALMOND',
  },
  {
    id: 'coconut',
    name: 'Coconut Milk',
    size: '400 ml',
    category: 'Coconut Milk',
    price: 140,
    mrp: 160,
    tags: ['Plant Based', 'Organic'],
    description: 'Rich, creamy coconut milk from fresh coconuts.',
    nextDeliveryDate: '2026-09-08',
    imageLabel: 'COCONUT',
  },
];

export default function ProductsScreen() {
  const [type, setType] = useState<'Dairy' | 'Non-Dairy'>('Dairy');
  const [category, setCategory] = useState('All');

  const { walletBalance, products } = useFreshStore();

  const categoryOptions: Array<string | { label: string; key: string; image: number | null }> =
    type === 'Dairy' ? dairySidebar : nonDairyCategories;

  const visibleProducts = useMemo(() => {
    const source = type === 'Dairy' ? products : nonDairyProducts;

    if (type === 'Dairy') {
      if (category === 'All') return source;
      if (category === 'Daily Pro+') return source.filter((product) => product.category === 'Milk');
      if (category === 'Curd & Paneer') return source.filter((product) => ['Curd', 'Paneer'].includes(product.category));
      return source.filter((product) => product.category === category);
    }

    if (category === 'All') return source;
    return source.filter((product) => product.category === category);
  }, [category, type, products]);

  const chooseType = (next: 'Dairy' | 'Non-Dairy') => {
    setType(next);
    setCategory('All');
  };

  return (
    <View className="flex-1 bg-[#F7F9FC]">

      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-5">
        <Text className="text-[22px] font-extrabold text-[#111827]">
          Products
        </Text>

        <WalletChip
          balance={walletBalance}
          onPress={() => router.push('/wallet')}
        />
      </View>

      <View className="mt-4 px-5">
        <View className="flex-row items-center justify-between gap-4 border-b border-[#E2E8F0] pb-3">
          {(['Dairy', 'Non-Dairy'] as const).map((item) => {
            const active = type === item;

            return (
              <Pressable
                key={item}
                onPress={() => chooseType(item)}
                className={`flex-1 items-center justify-center border-b-2 pb-2 ${
                  active ? 'border-[#1E4FFF]' : 'border-transparent'
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <Image
                    source={
                      item === 'Dairy'
                        ? require('@/assets/images/products/CowMilk-removebg-preview.png')
                        : require('@/assets/images/products/CowCurd-removebg-preview.png')
                    }
                    className="h-8 w-8"
                    resizeMode="contain"
                  />
                  <Text
                    className={`text-[14px] font-bold ${
                      active ? 'text-[#1E4FFF]' : 'text-[#64748B]'
                    }`}
                  >
                    {item}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-4 flex-row gap-3">
          {categoryOptions.map((item) => {
            const isSidebarItem = type === 'Dairy' && typeof item !== 'string';
            const label = isSidebarItem ? item.label : String(item);
            const currentKey = isSidebarItem ? item.key : String(item);
            const active = category === currentKey;
            const icon = isSidebarItem ? item.image : null;

            return (
              <Pressable
                key={currentKey}
                onPress={() => setCategory(currentKey)}
                className={`flex-1 items-center justify-center rounded-[18px] px-2 py-3 ${
                  active ? 'bg-[#F4F7FF]' : 'bg-transparent'
                }`}
                style={{ minWidth: 0 }}
              >
                {icon ? (
                  <Image
                    source={icon}
                    className="h-10 w-10"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3FF]">
                    <Text className="text-[10px] font-bold text-[#1E4FFF]">All</Text>
                  </View>
                )}

                <Text
                  className={`mt-2 text-center text-[12px] font-semibold ${
                    active ? 'text-[#111827]' : 'text-[#475569]'
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mt-4 flex-row px-5">

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: 100,
          }}
        >
          {visibleProducts.length === 0 ? (
            <View className="items-center py-[60px]">
              <Text className="text-[16px] font-bold text-[#111827]">
                No products found
              </Text>
            </View>
          ) : (
            visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => router.push(`/product/${product.id}`)}
                onAdd={() => router.push(`/product/${product.id}`)}
              />
            ))
          )}

          <TrustBadgeRow />
        </ScrollView>
      </View>
    </View>
  );
}
