import { useRef, useState } from 'react';
import { router } from 'expo-router';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
  Pressable,
  Text,
} from 'react-native';
import { PrimaryButton } from '@/components/FreshComponents';

const { width, height } = Dimensions.get('window');
const TOP_HEIGHT = height * 0.85;
const IMAGE_HEIGHT = height * 0.75;

const SLIDES = [
  { image: require('@/assets/images/onb-1.png') },
  { image: require('@/assets/images/onb-2.png') },
  { image: require('@/assets/images/onb-3.png') },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isLastSlide = activeIndex === SLIDES.length - 1;

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setActiveIndex(index);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const handleNext = () => {
    if (isLastSlide) {
      router.push('/auth');
    } else {
      goToSlide(activeIndex + 1);
    }
  };

  return (
    <View className="flex-1 bg-[#ffffff]">
      <View style={{ height: TOP_HEIGHT }} className="items-center justify-center">
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
        >
          {SLIDES.map((slide, i) => (
            <View
              key={i}
              style={{ width, height: TOP_HEIGHT }}
              className="items-center justify-center"
            >
              <Image
                source={slide.image}
                style={{ width, height: IMAGE_HEIGHT }}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <View className="flex-1 justify-between px-6 pb-8 pt-6">
        <View className="flex-row justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={
                i === activeIndex
                  ? 'h-2.5 w-9 rounded-full bg-[#1E4FFF]'
                  : 'h-2.5 w-2.5 rounded-full bg-gray-400'
              }
            />
          ))}
        </View>

        <View>
          <Pressable
            onPress={handleNext}
            className="h-16
             w-full items-center justify-center rounded-full bg-[#1E4FFF]"
          >
            <Text className="text-[20px] font-bold text-white">
              {isLastSlide ? 'Get Started' : 'Next'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}