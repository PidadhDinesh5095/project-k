import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowLeft,
  Bell,
  Building2,
  Check,
  Clock,
  DoorOpen,
  Footprints,
  Home,
  MapPin,
  Package,
  PawPrint,
  ShieldCheck,
} from 'lucide-react-native';
import { colors, PrimaryButton } from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';

const residenceTypes = [
  { key: 'Community/Apartment', icon: Building2 },
  { key: 'Independent', icon: Home },
] as const;

type ResidenceType = (typeof residenceTypes)[number]['key'];

// Each instruction can conflict with others — selecting one clears/disables its conflicts.
const instructionOptions = [
  { key: 'Pet at home', icon: PawPrint },
  { key: 'Leave at door', icon: DoorOpen },
  { key: 'Ring bell', icon: Bell },
  { key: 'Place in bag', icon: Package },
  { key: 'At shoe rack', icon: Footprints },
  { key: 'At security', icon: ShieldCheck },
] as const;

const CONFLICTS: Record<string, string[]> = {
  'Pet at home': ['Ring bell', 'At security'],
  'Ring bell': ['Pet at home','At security',],
  'Place in bag': ['Leave at door', 'At security', 'At shoe rack',],
  'Leave at door': ['Place in bag', 'At security', 'At shoe rack',],
  'At shoe rack': [ 'Place in bag', 'Leave at door','At security',],
};

export default function AddressSetupScreen() {
  const { addAddress } = useFreshStore();
  const params = useLocalSearchParams<{
    fullAddress?: string;
    areaName?: string;
    city?: string;
    pincode?: string;
    latitude?: string;
    longitude?: string;
  }>();

  const [residenceType, setResidenceType] = useState<ResidenceType>(
    'Community/Apartment',
  );
  const [flatDetails, setFlatDetails] = useState('');
  const [blockTower, setBlockTower] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [currentLocationText, setCurrentLocationText] = useState('');
  const [instructions, setInstructions] = useState<string[]>([]);

  // Populate fields once when returning from the map picker
  useEffect(() => {
    if (params.fullAddress) setCurrentLocationText(params.fullAddress);
    if (params.pincode) setPincode(params.pincode);
  }, [params.fullAddress, params.pincode]);

  const toggleInstruction = (key: string) => {
    setInstructions((prev) => {
      const isSelected = prev.includes(key);

      if (isSelected) {
        return prev.filter((item) => item !== key);
      }

      // Remove any conflicting selections before adding this one
      const conflicts = CONFLICTS[key] ?? [];
      const withoutConflicts = prev.filter((item) => !conflicts.includes(item));
      return [...withoutConflicts, key];
    });
  };

  const isInstructionDisabled = (key: string) => {
    const conflicts = CONFLICTS[key] ?? [];
    return conflicts.some((c) => instructions.includes(c));
  };

  const canSubmit =
    flatDetails.trim().length > 0 &&
    (residenceType === 'Independent' || blockTower.trim().length > 0) &&
    pincode.trim().length >= 6 &&
    currentLocationText.trim().length > 0;

  const handleSubmit = () => {
    addAddress({
      label: residenceType,
      line1: [flatDetails.trim(), blockTower.trim()].filter(Boolean).join(', '),
      city: params.city ?? '',
      pincode: pincode.trim(),
      isDefault: true,
      deliveryInstructions: instructions.join(', '),
    });

    router.replace('/complete-profile');
  };

  return (
    <View className="flex-1  bg-white">
      <Pressable className="ml-4 mt-2" onPress={() => router.back()} hitSlop={12}>
        <ArrowLeft size={28} color="#111827" />
      </Pressable>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
        <Text className="mt-2 text-[22px] font-extrabold text-[#111827]">
          Address
        </Text>

        {/* Residence Type */}
        <Text className="mb-2 mt-5 text-[14px] text-[#64748B]">
          Select your Residence Type
        </Text>

        <View className="flex-row gap-2.5">
          {residenceTypes.map(({ key, icon: Icon }) => {
            const selected = residenceType === key;
            return (
              <Pressable
                key={key}
                onPress={() => setResidenceType(key)}
                className={`flex-1 flex-row items-center gap-2 rounded-full px-4 py-3.5 ${
                  selected ? 'bg-[#111827]' : 'bg-[#F5F7FB]'
                }`}
              >
                <View
                  className={`h-[18px] w-[18px] items-center justify-center rounded-full border-2 ${
                    selected ? 'border-[#1E4FFF] bg-[#1E4FFF]' : 'border-[#CBD5E1]'
                  }`}
                >
                  {selected && <View className="h-[8px] w-[8px] rounded-full bg-black" />}
                </View>
                <Text
                  className={`text-[13px] font-semibold ${
                    selected ? 'text-white' : 'text-[#111827]'
                  }`}
                >
                  {key}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Flat / Apartment */}
        <Text className="mb-2 mt-6 text-[15px] font-extrabold text-[#111827]">
          Flat No./Apartment Name/Floor <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[14px] text-[15px] text-[#111827]"
          placeholder="e.g. N2001, Purva Highland, 20th Floor"
          placeholderTextColor={colors.muted}
          value={flatDetails}
          onChangeText={setFlatDetails}
        />

        {/* Block/Tower — only relevant for apartments/communities */}
        {residenceType === 'Community/Apartment' && (
          <>
            <Text className="mb-2 mt-2.5 text-[15px] font-extrabold text-[#111827]">
              Block/Tower <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[14px] text-[15px] text-[#111827]"
              placeholder="e.g. N Block"
              placeholderTextColor={colors.muted}
              value={blockTower}
              onChangeText={setBlockTower}
            />
          </>
        )}

        {/* Pincode */}
        <Text className="mb-2 mt-2.5 text-[15px] font-extrabold text-[#111827]">
          Pincode <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[14px] text-[15px] text-[#111827]"
          placeholder="e.g. 500039"
          placeholderTextColor={colors.muted}
          value={pincode}
          onChangeText={setPincode}
          keyboardType="number-pad"
          maxLength={6}
        />

        {/* Landmark */}
        <Text className="mb-2 mt-2.5 text-[15px] font-extrabold text-[#111827]">
          Landmark
        </Text>
        <TextInput
          className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[14px] text-[15px] text-[#111827]"
          placeholder="e.g. Near Holiday Village"
          placeholderTextColor={colors.muted}
          value={landmark}
          onChangeText={setLandmark}
        />

        {/* Current Location — filled from the map picker, tap to change */}
        <Text className="mb-2 mt-2.5 text-[15px] font-extrabold text-[#111827]">
          Current Location <Text className="text-red-500">*</Text>
        </Text>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/map-picker',
            })
          }
          className="mb-2.5 flex-row items-start gap-2 rounded-xl border border-[#E2E8F0] px-[14px] py-[14px]"
        >
          <MapPin size={16} color={colors.primary} style={{ marginTop: 2 }} />
          <Text className="flex-1 text-[14px] leading-[20px] text-[#111827]">
            {currentLocationText || 'Tap to select your location on map'}
          </Text>
        </Pressable>

        {/* Delivery Instructions */}
        <Text className="mb-2 mt-6 text-[15px] font-extrabold text-[#111827]">
          Delivery Instructions
        </Text>

        <View className="flex-row flex-wrap gap-2.5">
          {instructionOptions.map(({ key, icon: Icon }) => {
            const selected = instructions.includes(key);
            const disabled = !selected && isInstructionDisabled(key);

            return (
              <Pressable
                key={key}
                onPress={() => !disabled && toggleInstruction(key)}
                disabled={disabled}
                className={`w-[31%] items-center gap-1.5 rounded-2xl border px-2 py-3.5 ${
                  selected
                    ? 'border-[#111827] bg-[#111827]'
                    : disabled
                      ? 'border-[#E2E8F0] opacity-40'
                      : 'border-[#E2E8F0]'
                }`}
              >
                <View className="relative">
                  <Icon size={26} color={selected ? '#1E4FFF' : '#64748B'} />
                  {selected && (
                    <View className="absolute -right-1.5 -top-1.5 h-[16px] w-[16px] items-center justify-center rounded-md bg-[#1E4FFF]">
                      <Check size={10} color="#111827" />
                    </View>
                  )}
                </View>
                <Text
                  className={`text-center text-[12px] font-semibold ${
                    selected ? 'text-white' : 'text-[#111827]'
                  }`}
                >
                  {key}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Cutoff */}
        <View className="mt-5 flex-row items-center gap-2 rounded-xl bg-[#EEF3FF] p-3">
          <Clock size={14} color={colors.primary} />
          <Text className="flex-1 text-[12px] font-semibold text-[#1E4FFF]">
            Order before 10 PM for next-day morning delivery
          </Text>
        </View>

        <View className="mt-7">
          <Pressable
            onPress={handleSubmit}
            //disabled={!canSubmit}
            className={`rounded-full items-center justify-center  h-16 px-4 py-3 bg-[#1E4FFF] `}
          >
            <Text
              className={`text-center text-[20px] font-extrabold text-white`}
            >
              Save & Continue
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
           