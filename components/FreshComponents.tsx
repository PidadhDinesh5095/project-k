
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import {
  ChevronRight,
  Plus,
  ShieldCheck,
} from 'lucide-react-native';
import { Product } from '@/types/fresh';

export const colors = {
  primary: '#1E4FFF',
  deep: '#173FCC',
  bg: '#FFFFFF',
  mist: '#F5F7FB',
  green: '#22C55E',
  ink: '#0F172A',
  muted: '#64748B',
  line: '#E2E8F0',
  red: '#EF4444',
  amber: '#F59E0B',
};

export function WalletChip({
  balance,
  onPress,
}: {
  balance: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-[5px] rounded-[18px] bg-[#EEF3FF] px-[11px] py-2"
    >
      <Text className="text-[13px] text-[#1E4FFF]">
        ▣
      </Text>

      <Text className="text-[12px] font-bold text-[#1E4FFF]">
        ₹{balance.toFixed(2)}
      </Text>

      <ChevronRight
        size={14}
        color={colors.primary}
      />
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`min-h-[50px] flex-row items-center justify-center gap-2 rounded-[25px] bg-[#1E4FFF] ${
        disabled ? 'opacity-[0.45]' : ''
      }`}
    >
      <Text className="text-[15px] font-bold text-white">
        {label}
      </Text>

      <Text className="text-[18px] text-white">
        →
      </Text>
    </Pressable>
  );
}

export function StatusPill({
  label,
}: {
  label: string;
}) {
  const tone =
    label === 'Delivered' || label === 'Active'
      ? 'green'
      : label === 'Cancelled'
        ? 'red'
        : 'blue';

  return (
    <View
      className={`self-start rounded-xl px-[9px] py-1 ${
        tone === 'green'
          ? 'bg-[#DCFCE7]'
          : tone === 'red'
            ? 'bg-[#FEE2E2]'
            : 'bg-[#E0EAFF]'
      }`}
    >
      <Text
        className={`text-[11px] font-bold ${
          tone === 'green'
            ? 'text-[#15803D]'
            : tone === 'red'
              ? 'text-[#B91C1C]'
              : 'text-[#1E4FFF]'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

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

export function ProductCard({
  product,
  onPress,
  onAdd,
}: {
  product: Product;
  onPress: () => void;
  onAdd: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row gap-3.5 rounded-2xl border border-[#E2E8F0] bg-white p-3"
    >
      <View className="h-[94px] w-[94px] items-center justify-center overflow-hidden rounded-xl bg-[#E8EDF5]">
        {productImages[product.id] ? (
          <Image
            source={{ uri: productImages[product.id] }}
            className="h-full w-full"
          />
        ) : (
          <Text className="text-[14px] font-extrabold text-[#94A3B8]">
            {product.imageLabel}
          </Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-[15px] font-bold text-[#0F172A]">
          {product.name}
        </Text>

        <Text className="mt-1 text-[12px] text-[#64748B]">
          {product.size} · Fresh daily
        </Text>

        <View className="mt-2 flex-row gap-[5px]">
          {product.tags.slice(0, 2).map((tag) => (
            <View
              key={tag}
              className="rounded-[10px] bg-[#EEF3FF] px-1.5 py-[3px]"
            >
              <Text className="text-[9px] font-semibold text-[#1E4FFF]">
                {tag}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-[9px] flex-row items-center justify-between">
          <View>
            <Text className="text-[15px] font-extrabold text-[#0F172A]">
              ₹{product.price}
            </Text>

            <Text className="absolute left-[34px] top-[3px] text-[11px] text-[#64748B] line-through">
              ₹{product.mrp}
            </Text>
          </View>

          <Pressable
            onPress={onAdd}
            className="flex-row items-center gap-[3px] rounded-[17px] border border-[#1E4FFF] px-3 py-[7px]"
          >
            <Plus
              size={14}
              color={colors.primary}
            />

            <Text className="text-[12px] font-bold text-[#1E4FFF]">
              Add
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export function TrustBadgeRow() {
  return (
    <View className="my-3 flex-row justify-around rounded-[14px] bg-[#EEF3FF] p-3">
      <View className="flex-row items-center gap-1">
        <ShieldCheck
          size={14}
          color={colors.primary}
        />

        <Text className="text-[10px] text-[#0F172A]">
          Lab Tested
        </Text>
      </View>

      <View className="flex-row items-center gap-1">
        <ShieldCheck
          size={14}
          color={colors.green}
        />

        <Text className="text-[10px] text-[#0F172A]">
          No Additives
        </Text>
      </View>

      <View className="flex-row items-center gap-1">
        <ShieldCheck
          size={14}
          color={colors.primary}
        />

        <Text className="text-[10px] text-[#0F172A]">
          Farm Fresh
        </Text>
      </View>
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: string;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View className="min-h-[300px] flex-1 items-center justify-center px-7">
      <View className="mb-4 h-[72px] w-[72px] items-center justify-center rounded-full bg-[#EEF3FF]">
        <Text className="text-[28px] text-[#1E4FFF]">
          {icon}
        </Text>
      </View>

      <Text className="text-[16px] font-extrabold text-[#0F172A]">
        {title}
      </Text>

      <Text className="mt-2 max-w-[280px] text-center leading-5 text-[#64748B]">
        {body}
      </Text>

      {action && onAction ? (
        <Pressable onPress={onAction}>
          <Text className="text-[12px] font-bold text-[#1E4FFF]">
            {action} →
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View className="h-[54px] flex-row items-center justify-between border-b border-[#F1F5F9]">
      <Pressable
        onPress={onBack}
        hitSlop={12}
      >
        <Text className="w-[30px] text-[32px] leading-[30px] text-[#0F172A]">
          {onBack ? '‹' : ''}
        </Text>
      </Pressable>

      <Text className="text-[17px] font-extrabold text-[#0F172A]">
        {title}
      </Text>

      <View className="w-[76px] items-end">
        {right}
      </View>
    </View>
  );
}

export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-[17px] font-extrabold text-[#0F172A]">
        {title}
      </Text>

      {action ? (
        <Pressable onPress={onAction}>
          <Text className="text-[12px] font-bold text-[#1E4FFF]">
            {action} →
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}