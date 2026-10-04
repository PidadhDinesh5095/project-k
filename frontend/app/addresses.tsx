
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowLeft,
  Check,
  MapPin,
  Plus,
  Trash2,
  X,
} from 'lucide-react-native';
import { colors, PrimaryButton } from '@/components/FreshComponents';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  deleteAddress,
  DeliveryInstruction,
  fetchAddresses,
  ResidenceType,
  setDefaultAddress,
  updateAddress,
} from '@/store/slices/addressesSlice';
import { useFreshStore } from '@/store/useFreshStore';
import { Address } from '@/types/fresh';

const instructionValues: Record<string, DeliveryInstruction> = {
  'Pet at home': 'PET_AT_HOME',
  'Leave at door': 'LEAVE_AT_DOOR',
  'Ring bell': 'RING_BELL',
  'Place in bag': 'PLACE_IN_BAG',
  'At shoe rack': 'AT_SHOE_RACK',
  'At security': 'AT_SECURITY',
};

export default function AddressesScreen() {
  const { addresses } = useFreshStore();
  const dispatch = useAppDispatch();
  const { isLoading, isUpdating, isDeleting, error } = useAppSelector((state) => state.addresses);

  const [editing, setEditing] = useState<Address | null>(null);
  const [residenceType, setResidenceType] = useState<ResidenceType>('COMMUNITY_APARTMENT');
  const [flatDetails, setFlatDetails] = useState('');
  const [blockTower, setBlockTower] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const openEdit = (address: Address) => {
    setEditing(address);
    setResidenceType(address.residenceType ?? 'COMMUNITY_APARTMENT');
    setFlatDetails(address.flatNoApartmentFloor ?? address.line1);
    setBlockTower(address.blockTower ?? '');
    setPincode(address.pincode);
    setLandmark(address.landmark ?? '');
    setInstructions(address.deliveryInstructions ?? '');
  };

  const saveEdit = async () => {
    if (!editing || !flatDetails.trim() || !/^\d{6}$/.test(pincode.trim())) return;

    const deliveryInstructions = instructions
      .split(',')
      .map((instruction) => instructionValues[instruction.trim()])
      .filter((instruction): instruction is DeliveryInstruction => !!instruction);

    try {
      await dispatch(updateAddress({
        id: editing.id,
        residenceType,
        flatNoApartmentFloor: flatDetails.trim(),
        blockTower: residenceType === 'COMMUNITY_APARTMENT' ? blockTower.trim() : '',
        pincode: pincode.trim(),
        landmark: landmark.trim(),
        lat: editing.lat,
        lng: editing.lng,
        deliveryInstructions,
        city: editing.city,
      })).unwrap();
      setEditing(null);
    } catch {
      // The rejected thunk stores the API error in Redux for display.
    }
  };

  return (
    <View className="flex-1 bg-[#F7F9FC]">
      {/* Back */}
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
        {/* Title */}
        <Text className="mb-4 mt-2 text-[22px] font-raleway-semibold text-[#111827]">
          Delivery Addresses
        </Text>
        {isLoading && <ActivityIndicator className="my-3" color={colors.primary} />}
        {!!error && <Text className="mb-3 text-[13px] text-red-600">{error}</Text>}

        {/* Address Cards */}
        {addresses.map((address) => (
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
                  <Text className="text-[15px] font-raleway-semibold text-[#111827]">
                    {address.label}
                  </Text>

                  {address.isDefault && (
                    <View className="rounded-lg bg-[#EEF3FF] px-1.5 py-0.5">
                      <Text className="text-[10px] font-bold text-[#023E8A]">
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
                  {address.city ? `${address.city} - ` : ''}{address.pincode}
                </Text>

                {/* Recipient */}
                {address.recipientName ? (
                  <Text className="mt-1.5 text-[12px] font-raleway-semibold text-[#111827]">
                    For: {address.recipientName} ·{' '}
                    {address.recipientPhone}
                  </Text>
                ) : null}

                {/* Instructions */}
                {address.deliveryInstructions ? (
                  <Text className="mt-1.5 text-[12px] font-raleway-semibold text-[#023E8A]">
                    Instructions: {address.deliveryInstructions}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Actions */}
            <View className="mt-3.5 flex-row gap-2 border-t border-[#F1F5F9] pt-3.5">
              {!address.isDefault && (
                <Pressable
                  className="flex-1 items-center rounded-xl border border-[#64748B] py-2.5"
                  onPress={() => dispatch(setDefaultAddress(address.id))}
                >
                  <Text className="text-[12px] font-raleway-semibold text-[#475569]">Set default</Text>
                </Pressable>
              )}
              {/* Edit */}
              <Pressable
                className="flex-1 items-center rounded-xl border border-[#023E8A] py-2.5"
                onPress={() => openEdit(address)}
              >
                <Text className="text-[13px] font-raleway-semibold text-[#023E8A]">
                  Edit
                </Text>
              </Pressable>

              {/* Delete */}
              <Pressable
                className="flex-1 flex-row items-center justify-center gap-1 rounded-xl border border-[#EF4444] py-2.5"
                onPress={() => dispatch(deleteAddress(address.id))}
                disabled={addresses.length === 1 || isDeleting}
              >
                <Trash2
                  size={14}
                  color={
                    addresses.length === 1 || isDeleting
                      ? colors.muted
                      : colors.red
                  }
                />

                <Text
                  className={`text-[13px] font-raleway-semibold ${
                    addresses.length === 1 || isDeleting
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
          className="mt-1 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-[#023E8A] p-[18px]"
          onPress={() => router.push('/address-setup')}
        >
          <Plus
            size={18}
            color={colors.primary}
          />

          <Text className="text-[14px] font-bold text-[#023E8A]">
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
              <Text className="text-[20px] font-bold text-[#111827]">
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

            <View className="mb-2.5 flex-row gap-2">
              {([
                ['COMMUNITY_APARTMENT', 'Community/Apartment'],
                ['INDEPENDENT', 'Independent'],
              ] as const).map(([value, title]) => (
                <Pressable
                  key={value}
                  onPress={() => setResidenceType(value)}
                  className={`flex-1 items-center rounded-xl border px-2 py-3 ${residenceType === value ? 'border-[#023E8A] bg-[#EEF3FF]' : 'border-[#E2E8F0]'}`}
                >
                  <Text className="text-[12px] font-raleway-semibold text-[#111827]">{title}</Text>
                </Pressable>
              ))}
            </View>

            {/* Flat or house details */}
            <TextInput
              className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[13px] text-[14px] text-[#111827]"
              placeholder="Flat / House No. / Floor"
              placeholderTextColor={colors.muted}
              value={flatDetails}
              onChangeText={setFlatDetails}
            />

            {residenceType === 'COMMUNITY_APARTMENT' && (
              <TextInput
                className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[13px] text-[14px] text-[#111827]"
                placeholder="Block / Tower"
                placeholderTextColor={colors.muted}
                value={blockTower}
                onChangeText={setBlockTower}
              />
            )}

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

            <TextInput
              className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[13px] text-[14px] text-[#111827]"
              placeholder="Landmark (optional)"
              placeholderTextColor={colors.muted}
              value={landmark}
              onChangeText={setLandmark}
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
              label={isUpdating ? 'Saving...' : 'Save Address'}
              disabled={isUpdating || !flatDetails.trim() || !/^\d{6}$/.test(pincode.trim()) || (residenceType === 'COMMUNITY_APARTMENT' && !blockTower.trim())}
              onPress={saveEdit}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
