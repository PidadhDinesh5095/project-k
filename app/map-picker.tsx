import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ArrowLeft, LocateFixed, MapPin, Search } from 'lucide-react-native';
import { colors } from '@/components/FreshComponents';

const DEFAULT_REGION: Region = {
  latitude: 17.385,
  longitude: 78.4867,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const GEOCODING_API_KEY = process.env.EXPO_PUBLIC_GEOCODING_API_KEY;

export default function MapPickerScreen() {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [locatingDevice, setLocatingDevice] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    useCurrentLocation();
  }, []);

  // Reverse geocode: coordinates -> readable address (Google Geocoding API)
  const reverseGeocodeRegion = async (r: Region) => {
    try {
      setResolvingAddress(true);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${r.latitude},${r.longitude}&key=${GEOCODING_API_KEY}`,
      );
      const data = await response.json();

      if (data.status !== 'OK' || !data.results?.length) {
        console.log('Reverse geocode failed:', data.status, data.error_message);
        return;
      }

      const result = data.results[0];
      const components = result.address_components;

      const findComponent = (type: string) =>
        components.find((c: any) => c.types.includes(type))?.long_name;

      const area =
        findComponent('sublocality') ||
        findComponent('neighborhood') ||
        findComponent('locality') ||
        'Selected location';

      setAreaName(area);
      setFullAddress(result.formatted_address);
      setCity(findComponent('locality') || findComponent('administrative_area_level_2') || '');
      setPincode(findComponent('postal_code') || '');
    } catch (error) {
      console.log('Reverse geocode error:', error);
    } finally {
      setResolvingAddress(false);
    }
  };

  const useCurrentLocation = async () => {
    try {
      setLocatingDevice(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const nextRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(nextRegion);
      mapRef.current?.animateToRegion(nextRegion, 500);
      reverseGeocodeRegion(nextRegion);
    } catch (error) {
      console.log('Location error:', error);
    } finally {
      setLocatingDevice(false);
    }
  };

  // Forward geocode: search text -> coordinates (Google Geocoding API)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          searchQuery.trim(),
        )}&key=${GEOCODING_API_KEY}`,
      );
      const data = await response.json();

      if (data.status !== 'OK' || !data.results?.length) {
        console.log('Search failed:', data.status, data.error_message);
        return;
      }

      const location = data.results[0].geometry.location;
      const nextRegion: Region = {
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(nextRegion);
      mapRef.current?.animateToRegion(nextRegion, 500);
      reverseGeocodeRegion(nextRegion);
    } catch (error) {
      console.log('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleRegionChangeComplete = (r: Region) => {
    setRegion(r);
    reverseGeocodeRegion(r);
  };

  const handleConfirm = () => {
    router.push({
      pathname: '/address-setup',
      params: {
        fullAddress,
        areaName,
        city,
        pincode,
        latitude: String(region.latitude),
        longitude: String(region.longitude),
      },
    });
  };

  return (
    <View style={{ flex: 1 }} className="bg-white">
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={{ flex: 1, width: '100%', height: '100%' }}
        initialRegion={DEFAULT_REGION}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        scrollEnabled
        zoomEnabled
        rotateEnabled
        pitchEnabled
      />

      {/* Fixed center pin — the map moves under it, not the pin itself */}
      <View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center"
        style={{ marginBottom: 36 }}
      >
        <MapPin size={42} color="#1E4FFF" fill="#1E4FFF" />
      </View>

      {/* Top bar */}
      <View
        className="absolute left-0 right-0 flex-row items-center gap-2 px-4"
        style={{ top: Platform.OS === 'ios' ? 56 : 36 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="ml-4 mt-2 h-12 w-12 items-center justify-center rounded-full bg-white shadow"
          hitSlop={12}
        >
          <ArrowLeft size={22} color="#111827" />
        </Pressable>

        <View className="h-12 flex-1 flex-row items-center gap-2 rounded-full bg-white px-4 shadow">
          <Search size={16} color={colors.muted} />
          <TextInput
            className="flex-1 text-[14px] text-[#111827]"
            placeholder="Search for area, street name..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searching && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
      </View>

      {/* Bottom sheet */}
      <View className="absolute bottom-0 left-0 right-0 rounded-t-[24px] bg-white px-5 pb-8 pt-4 shadow-lg">
        <Pressable
          onPress={useCurrentLocation}
          disabled={locatingDevice}
          className={`mb-4 flex-row items-center justify-center gap-2 rounded-xl bg-[#1E4FFF] py-3.5 ${
            locatingDevice ? 'opacity-60' : ''
          }`}
        >
          <LocateFixed size={16} color="#fff" />
          <Text className="text-[14px] font-bold text-white">
            {locatingDevice ? 'Locating…' : 'Use Current Location'}
          </Text>
        </Pressable>

        <View className="flex-row items-start gap-2.5">
          <MapPin size={18} color="#1E4FFF" fill="#1E4FFF" style={{ marginTop: 2 }} />
          <View className="flex-1">
            <Text className="text-[16px] font-extrabold text-[#111827]">
              {resolvingAddress ? 'Finding address…' : areaName || 'Move the map to select'}
            </Text>
            {!!fullAddress && (
              <Text className="mt-1 text-[13px] leading-[19px] text-[#475569]">
                {fullAddress}
              </Text>
            )}
          </View>
        </View>

        <Pressable
          onPress={handleConfirm}
          disabled={!fullAddress || resolvingAddress}
          className={`mt-5 items-center justify-center rounded-xl py-4 ${
            fullAddress && !resolvingAddress ? 'bg-[#1E4FFF]' : 'bg-[#93A9FF]'
          }`}
        >
          <Text className="text-[15px] font-bold text-white">Confirm Location</Text>
        </Pressable>
      </View>
    </View>
  );
}