
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Check,
  MapPin,
  Plus,
  Trash2,
  X,
} from 'lucide-react-native';
import { colors, PrimaryButton } from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';
import { Address } from '@/types/fresh';

export default function AddressesScreen() {
  const { user, updateAddress, deleteAddress } = useFreshStore();

  const [editing, setEditing] = useState<Address | null>(null);
  const [label, setLabel] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [instructions, setInstructions] = useState('');

  const openEdit = (address: Address) => {
    setEditing(address);
    setLabel(address.label);
    setLine1(address.line1);
    setCity(address.city);
    setPincode(address.pincode);
    setInstructions(address.deliveryInstructions ?? '');
  };

  const saveEdit = () => {
    if (
      !editing ||
      !line1.trim() ||
      !city.trim() ||
      pincode.trim().length < 6
    ) {
      return;
    }

    updateAddress({
      ...editing,
      label: label.trim(),
      line1: line1.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      deliveryInstructions: instructions.trim(),
    });

    setEditing(null);
  };

  return (
    <View className="flex-1 bg-[#F7F9FC] pt-[52px]">
      {/* Back */}
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
        {/* Title */}
        <Text className="mb-4 mt-2 text-[22px] font-extrabold text-[#111827]">
          Delivery Addresses
        </Text>

        {/* Address Cards */}
        {user.addresses.map((address) => (
          <View
            key={address.id}
            className="mb-3 rounded-2xl border border-[#E2E8F0] bg-white p-[14px]"
          >
            {/* Card Top */}
            <View className="flex-row gap-3">
              {/* Location Icon */}
              <View className="h-9 w-9 items-center justify-center rounded-[10px] bg-[#EEF3FF]">
                <MapPin
                  size={16}
                  color={colors.primary}
                />
              </View>

              <View className="flex-1">
                {/* Label */}
                <View className="flex-row items-center gap-2">
                  <Text className="text-[15px] font-extrabold text-[#111827]">
                    {address.label}
                  </Text>

                  {address.isDefault && (
                    <View className="rounded-lg bg-[#EEF3FF] px-1.5 py-0.5">
                      <Text className="text-[10px] font-bold text-[#1E4FFF]">
                        Default
                      </Text>
                    </View>
                  )}
                </View>

                {/* Address */}
                <Text className="mt-1.5 text-[13px] text-[#64748B]">
                  {address.line1}
                </Text>

                {/* City */}
                <Text className="mt-0.5 text-[13px] text-[#64748B]">
                  {address.city} - {address.pincode}
                </Text>

                {/* Recipient */}
                {address.recipientName ? (
                  <Text className="mt-1.5 text-[12px] font-semibold text-[#111827]">
                    For: {address.recipientName} ·{' '}
                    {address.recipientPhone}
                  </Text>
                ) : null}

                {/* Instructions */}
                {address.deliveryInstructions ? (
                  <Text className="mt-1.5 text-[12px] font-semibold text-[#1E4FFF]">
                    Instructions: {address.deliveryInstructions}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Actions */}
            <View className="mt-3.5 flex-row gap-2.5 border-t border-[#F1F5F9] pt-3.5">
              {/* Edit */}
              <Pressable
                className="flex-1 items-center rounded-xl border border-[#1E4FFF] py-2.5"
                onPress={() => openEdit(address)}
              >
                <Text className="text-[13px] font-bold text-[#1E4FFF]">
                  Edit
                </Text>
              </Pressable>

              {/* Delete */}
              <Pressable
                className="flex-1 flex-row items-center justify-center gap-1 rounded-xl border border-[#EF4444] py-2.5"
                onPress={() => deleteAddress(address.id)}
                disabled={user.addresses.length === 1}
              >
                <Trash2
                  size={14}
                  color={
                    user.addresses.length === 1
                      ? colors.muted
                      : colors.red
                  }
                />

                <Text
                  className={`text-[13px] font-bold ${
                    user.addresses.length === 1
                      ? 'text-[#64748B]'
                      : 'text-[#EF4444]'
                  }`}
                >
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        ))}

        {/* Add Address */}
        <Pressable
          className="mt-1 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1E4FFF] p-[18px]"
          onPress={() => router.push('/address-setup')}
        >
          <Plus
            size={18}
            color={colors.primary}
          />

          <Text className="text-[14px] font-bold text-[#1E4FFF]">
            Add New Address
          </Text>
        </Pressable>
      </ScrollView>

      {/* Edit Address Modal */}
      <Modal
        visible={editing !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditing(null)}
      >
        <View className="flex-1 justify-end bg-black/45">
          <View className="rounded-t-[24px] bg-white px-5 pb-9 pt-5">
            {/* Header */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[20px] font-extrabold text-[#111827]">
                Edit Address
              </Text>

              <Pressable
                onPress={() => setEditing(null)}
                hitSlop={10}
              >
                <X
                  size={20}
                  color={colors.muted}
                />
              </Pressable>
            </View>

            {/* Label */}
            <TextInput
              className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[13px] text-[14px] text-[#111827]"
              placeholder="Label"
              placeholderTextColor={colors.muted}
              value={label}
              onChangeText={setLabel}
            />

            {/* Address */}
            <TextInput
              className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[13px] text-[14px] text-[#111827]"
              placeholder="Flat / House No. & Street"
              placeholderTextColor={colors.muted}
              value={line1}
              onChangeText={setLine1}
            />

            {/* City */}
            <TextInput
              className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[13px] text-[14px] text-[#111827]"
              placeholder="City"
              placeholderTextColor={colors.muted}
              value={city}
              onChangeText={setCity}
            />

            {/* Pincode */}
            <TextInput
              className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[13px] text-[14px] text-[#111827]"
              placeholder="Pincode"
              placeholderTextColor={colors.muted}
              value={pincode}
              onChangeText={setPincode}
              keyboardType="number-pad"
              maxLength={6}
            />

            {/* Instructions */}
            <TextInput
              className="mb-2.5 min-h-[70px] rounded-xl border border-[#E2E8F0] px-[14px] py-[13px] text-[14px] text-[#111827]"
              placeholder="Delivery instructions (optional)"
              placeholderTextColor={colors.muted}
              value={instructions}
              onChangeText={setInstructions}
              multiline
              textAlignVertical="top"
            />

            <PrimaryButton
              label="Save Address"
              disabled={
                !line1.trim() ||
                !city.trim() ||
                pincode.trim().length < 6
              }
              onPress={saveEdit}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
