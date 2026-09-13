
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Check, Clock, LocateFixed } from 'lucide-react-native';
import { colors, PrimaryButton } from '@/components/FreshComponents';
import { useFreshStore } from '@/store/useFreshStore';

const labelOptions = ['Home', 'Work', 'Other'];
const instructionOptions = [
  'Leave at door',
  'Call on arrival',
  'Ring bell',
  'Hand delivery only',
];

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function AddressSetupScreen() {
  const { addAddress } = useFreshStore();

  const [label, setLabel] = useState('Home');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [instructions, setInstructions] = useState<string[]>([]);
  const [customInstruction, setCustomInstruction] = useState('');
  const [bookingForOther, setBookingForOther] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [checkingAddress, setCheckingAddress] = useState(false);

  const toggleInstruction = (instruction: string) => {
    setInstructions((prev) =>
      prev.includes(instruction)
        ? prev.filter((item) => item !== instruction)
        : [...prev, instruction]
    );
  };

  const useCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationMessage(null);

      // Ask user for location permission
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        setLocationMessage(
          'Location permission was not granted. You can enter the address manually.'
        );
        return;
      }

      // Get current GPS location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCurrentLocation(location);

      const { latitude, longitude } = location.coords;

      // Convert coordinates into an address
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (!addresses.length) {
        setLocationMessage(
          'We could not find an address for your current location.'
        );
        return;
      }

      const address = addresses[0];

      // Build street address
      const streetParts = [
        address.name,
        address.street,
      ].filter(Boolean);

      const streetAddress = streetParts
        .filter(
          (value, index, array) =>
            array.indexOf(value) === index
        )
        .join(' ');

      // Fill the form
      setLine1(
        streetAddress ||
          address.district ||
          address.subregion ||
          ''
      );

      setCity(
        address.city ||
          address.district ||
          address.subregion ||
          ''
      );

      setPincode(address.postalCode || '');

      setLocationMessage(
        'Current location added. Please review the address before saving.'
      );
    } catch (error) {
      console.log('Location error:', error);

      setLocationMessage(
        'We could not get your current location. Please enter the address manually.'
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const checkAddressDistance = async () => {
    try {
      setCheckingAddress(true);

      let userLocation = currentLocation;

      if (!userLocation) {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== Location.PermissionStatus.GRANTED) {
          Alert.alert(
            'Location Required',
            'Please allow location access so we can check whether this address is within our service area.'
          );

          return false;
        }

        userLocation =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        setCurrentLocation(userLocation);
      }

      const addressQuery =
        `${line1.trim()}, ${city.trim()}, ${pincode.trim()}`;

      const results =
        await Location.geocodeAsync(addressQuery);

      if (!results.length) {
        Alert.alert(
          'Address Not Found',
          'We could not find this address. Please check the address and try again.'
        );

        return false;
      }

      const enteredAddress = results[0];

      const distance = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        enteredAddress.latitude,
        enteredAddress.longitude
      );

      // Change this to your actual service radius.
      const SERVICE_RADIUS_KM = 10;

      if (distance > SERVICE_RADIUS_KM) {
        return new Promise<boolean>((resolve) => {
          Alert.alert(
            'Address is outside our service area',
            `This delivery address is approximately ${distance.toFixed(
              1
            )} km away from your current location.\n\nAre you booking this delivery for another person?`,
            [
              {
                text: 'No',
                style: 'cancel',
                onPress: () => resolve(false),
              },
              {
                text: 'Yes',
                onPress: () => {
                  setBookingForOther(true);
                  resolve(true);
                },
              },
            ]
          );
        });
      }

      return true;
    } catch (error) {
      console.log('Address distance error:', error);

      Alert.alert(
        'Unable to check address',
        'We could not verify the delivery location. Please try again.'
      );

      return false;
    } finally {
      setCheckingAddress(false);
    }
  };

  const allInstructions = [
    ...instructions,
    ...(customInstruction.trim()
      ? [customInstruction.trim()]
      : []),
  ];

  const canSubmit =
    line1.trim().length > 0 &&
    city.trim().length > 0 &&
    pincode.trim().length >= 6 &&
    (!bookingForOther ||
      (recipientName.trim().length > 0 &&
        recipientPhone.trim().length >= 10));

  const handleSubmit = async () => {
    const addressIsValid = await checkAddressDistance();

    if (!addressIsValid) {
      return;
    }

    addAddress({
      label,
      line1: line1.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      isDefault: true,
      deliveryInstructions: allInstructions.join(', '),
      recipientName: bookingForOther
        ? recipientName.trim()
        : undefined,
      recipientPhone: bookingForOther
        ? recipientPhone.trim()
        : undefined,
    });

    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-white pt-[52px]">
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
        <Text className="mt-2 text-[22px] font-extrabold text-[#111827]">
          Delivery Address
        </Text>

        <Text className="mb-2 mt-1.5 text-[14px] text-[#64748B]">
          Where should we deliver your fresh products?
        </Text>

        {/* Current Location */}
        <Pressable
          onPress={useCurrentLocation}
          disabled={locationLoading}
          className={`mt-3 flex-row items-center justify-center gap-2 rounded-xl border border-[#1E4FFF] py-3 ${
            locationLoading ? 'opacity-50' : ''
          }`}
        >
          <LocateFixed
            size={17}
            color={colors.primary}
          />

          <Text className="text-[13px] font-bold text-[#1E4FFF]">
            {locationLoading
              ? 'Finding your location…'
              : 'Use my current location'}
          </Text>
        </Pressable>

        {locationMessage ? (
          <Text className="mt-2 text-[12px] leading-[18px] text-[#1E4FFF]">
            {locationMessage}
          </Text>
        ) : null}

        {/* Address Label */}
        <Text className="mb-2 mt-5 text-[15px] font-extrabold text-[#111827]">
          Address Label
        </Text>

        <View className="flex-row gap-2">
          {labelOptions.map((item) => (
            <Pressable
              key={item}
              onPress={() => setLabel(item)}
              className={`rounded-[14px] px-[18px] py-2.5 ${
                label === item
                  ? 'bg-[#1E4FFF]'
                  : 'bg-[#F5F7FB]'
              }`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  label === item
                    ? 'text-white'
                    : 'text-[#111827]'
                }`}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Address */}
        <Text className="mb-2 mt-5 text-[15px] font-extrabold text-[#111827]">
          Flat / House No. & Street
        </Text>

        <TextInput
          className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[14px] text-[15px] text-[#111827]"
          placeholder="e.g. 12 Lake View Apartments, HSR Layout"
          placeholderTextColor={colors.muted}
          value={line1}
          onChangeText={setLine1}
        />

        <Text className="mb-2 mt-2.5 text-[15px] font-extrabold text-[#111827]">
          City
        </Text>

        <TextInput
          className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[14px] text-[15px] text-[#111827]"
          placeholder="e.g. Bangalore"
          placeholderTextColor={colors.muted}
          value={city}
          onChangeText={setCity}
        />

        <Text className="mb-2 mt-2.5 text-[15px] font-extrabold text-[#111827]">
          Pincode
        </Text>

        <TextInput
          className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[14px] text-[15px] text-[#111827]"
          placeholder="e.g. 560102"
          placeholderTextColor={colors.muted}
          value={pincode}
          onChangeText={setPincode}
          keyboardType="number-pad"
          maxLength={6}
        />

        {/* Booking For Someone Else */}
        <Pressable
          onPress={() =>
            setBookingForOther((value) => !value)
          }
          className="mt-2.5 flex-row items-center gap-2.5 rounded-[14px] border border-[#E2E8F0] p-[14px]"
        >
          <View
            className={`h-[22px] w-[22px] items-center justify-center rounded-md border-2 ${
              bookingForOther
                ? 'border-[#1E4FFF] bg-[#1E4FFF]'
                : 'border-[#E2E8F0]'
            }`}
          >
            {bookingForOther && (
              <Check size={13} color="#fff" />
            )}
          </View>

          <View className="flex-1">
            <Text className="text-[14px] font-bold text-[#111827]">
              Booking for another person
            </Text>

            <Text className="mt-[3px] text-[12px] text-[#64748B]">
              Add the recipient’s details for this delivery
            </Text>
          </View>
        </Pressable>

        {bookingForOther ? (
          <View className="mt-2.5">
            <TextInput
              className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[14px] text-[15px] text-[#111827]"
              placeholder="Recipient name"
              placeholderTextColor={colors.muted}
              value={recipientName}
              onChangeText={setRecipientName}
            />

            <TextInput
              className="mb-2.5 rounded-xl border border-[#E2E8F0] px-[14px] py-[14px] text-[15px] text-[#111827]"
              placeholder="Recipient phone number"
              placeholderTextColor={colors.muted}
              value={recipientPhone}
              onChangeText={setRecipientPhone}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>
        ) : null}

        {/* Delivery Instructions */}
        <Text className="mb-2 mt-5 text-[15px] font-extrabold text-[#111827]">
          Delivery Instructions
        </Text>

        <Text className="-mt-1 mb-2.5 text-[12px] text-[#64748B]">
          Help our delivery partner reach you better
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {instructionOptions.map((item) => {
            const selected = instructions.includes(item);

            return (
              <Pressable
                key={item}
                onPress={() => toggleInstruction(item)}
                className={`flex-row items-center gap-1.5 rounded-[14px] px-[14px] py-2.5 ${
                  selected
                    ? 'bg-[#1E4FFF]'
                    : 'bg-[#F5F7FB]'
                }`}
              >
                {selected && (
                  <Check size={12} color="#fff" />
                )}

                <Text
                  className={`text-[12px] font-semibold ${
                    selected
                      ? 'text-white'
                      : 'text-[#111827]'
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Custom Instructions */}
        <Text className="mb-2 mt-5 text-[15px] font-extrabold text-[#111827]">
          Custom Instructions (Optional)
        </Text>

        <TextInput
          className="mb-2.5 min-h-20 rounded-xl border border-[#E2E8F0] px-[14px] pb-[14px] pt-[14px] text-[15px] text-[#111827]"
          placeholder="e.g. Gate code 1234, dog in yard, etc."
          placeholderTextColor={colors.muted}
          value={customInstruction}
          onChangeText={setCustomInstruction}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Cutoff */}
        <View className="mt-3 flex-row items-center gap-2 rounded-xl bg-[#EEF3FF] p-3">
          <Clock
            size={14}
            color={colors.primary}
          />

          <Text className="flex-1 text-[12px] font-semibold text-[#1E4FFF]">
            Order before 10 PM for next-day morning delivery
          </Text>
        </View>

        {/* Save */}
        <View className="mt-7">
          <PrimaryButton
            label={
              checkingAddress
                ? 'Checking address...'
                : 'Save & Continue'
            }
            disabled={!canSubmit || checkingAddress}
            onPress={handleSubmit}
          />
        </View>
      </ScrollView>
    </View>
  );
}
