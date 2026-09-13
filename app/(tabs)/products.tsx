
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors, ProductCard, SectionTitle, TrustBadgeRow, WalletChip } from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';
import { Product } from '@/types/fresh';

const dairyCategories = ['All', 'Milk', 'Curd', 'Paneer', 'Ghee'];
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
  const [search, setSearch] = useState('');

  const { walletBalance, products } = useFreshStore();

  const categoryOptions =
    type === 'Dairy' ? dairyCategories : nonDairyCategories;

  const visibleProducts = useMemo(() => {
    const source = type === 'Dairy' ? products : nonDairyProducts;

    let result =
      category === 'All'
        ? source
        : source.filter((product) => product.category === category);

    if (search.trim()) {
      const query = search.trim().toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [category, type, search, products]);

  const chooseType = (next: 'Dairy' | 'Non-Dairy') => {
    setType(next);
    setCategory('All');
    setSearch('');
  };

  return (
    <View className="flex-1 bg-[#F7F9FC]">

      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-5 pt-[52px]">
        <Text className="text-[22px] font-extrabold text-[#111827]">
          Products
        </Text>

        <WalletChip
          balance={walletBalance}
          onPress={() => router.push('/wallet')}
        />
      </View>

      {/* Dairy / Non-Dairy */}
      <View className="mx-5 mt-4 flex-row border-b border-[#E2E8F0]">
        {(['Dairy', 'Non-Dairy'] as const).map((item) => {
          const active = type === item;

          return (
            <Pressable
              key={item}
              onPress={() => chooseType(item)}
              className={`mr-[22px] border-b-2 px-[6px] pb-[10px] ${
                active
                  ? 'border-[#1E4FFF]'
                  : 'border-transparent'
              }`}
            >
              <Text
                className={`text-[14px] font-bold ${
                  active ? 'text-[#1E4FFF]' : 'text-[#64748B]'
                }`}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Search */}
      <View className="mt-[14px] px-5">
        <View className="h-12 flex-row items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-[14px]">
          <Search size={16} color={colors.muted} />

          <TextInput
            className="flex-1 p-0 text-[14px] text-[#111827]"
            placeholder="Search for milk, ghee, paneer…"
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch('')}
              hitSlop={8}
            >
              <X size={16} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Categories */}
      <View className="mt-[14px] mb-1">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            gap: 8,
          }}
        >
          {categoryOptions.map((item) => {
            const active = category === item;

            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                className={`h-9 justify-center rounded-[16px] border px-4 ${
                  active
                    ? 'border-[#1E4FFF] bg-[#1E4FFF]'
                    : 'border-[#E2E8F0] bg-white'
                }`}
              >
                <Text
                  className={`text-[13px] leading-4 font-semibold ${
                    active ? 'text-white' : 'text-[#111827]'
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Product List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      >
        <SectionTitle title={`${type} Products`} />

        <Text className="mt-[-4px] mb-3 text-[12px] text-[#64748B]">
          Showing {visibleProducts.length} product
          {visibleProducts.length !== 1 ? 's' : ''}
          {search.trim() ? ` for "${search.trim()}"` : ''}
        </Text>

        {visibleProducts.length === 0 ? (
          <View className="items-center py-[60px]">
            <Text className="text-[16px] font-bold text-[#111827]">
              No products found
            </Text>

            <Text className="mt-[6px] text-[13px] text-[#64748B]">
              Try a different search or category
            </Text>
          </View>
        ) : (
          visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() =>
                router.push(`/product/${product.id}`)
              }
              onAdd={() =>
                router.push(`/product/${product.id}`)
              }
            />
          ))
        )}

        <TrustBadgeRow />
      </ScrollView>
    </View>
  );
}
