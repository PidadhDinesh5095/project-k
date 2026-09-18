import { Tabs } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useFreshStore } from '@/store/useFreshStore';

const BLUE = '#1E4FFF';
const WHITE = '#FFFFFF';

const HOME_NOT_SELECTED =
  'M304 70.1C313.1 61.9 326.9 61.9 336 70.1L568 278.1C577.9 286.9 578.7 302.1 569.8 312C560.9 321.9 545.8 322.7 535.9 313.8L527.9 306.6L527.9 511.9C527.9 547.2 499.2 575.9 463.9 575.9L175.9 575.9C140.6 575.9 111.9 547.2 111.9 511.9L111.9 306.6L103.9 313.8C94 322.6 78.9 321.8 70 312C61.1 302.2 62 287 71.8 278.1L304 70.1zM320 120.2L160 263.7L160 512C160 520.8 167.2 528 176 528L224 528L224 424C224 384.2 256.2 352 296 352L344 352C383.8 352 416 384.2 416 424L416 528L464 528C472.8 528 480 520.8 480 512L480 263.7L320 120.3zM272 528L368 528L368 424C368 410.7 357.3 400 344 400L296 400C282.7 400 272 410.7 272 424L272 528z';

const HOME_SELECTED =
  'M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528 336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z';

function MilkPacketIcon({
  focused,
  size,
}: {
  focused: boolean;
  size: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
    >
      {focused ? (
        <>
          <Path
            fill={BLUE}
            d="M11 13L18 7H46L53 13V51C53 54.3 50.3 57 47 57H17C13.7 57 11 54.3 11 51V13Z"
          />

          <Path
            fill={WHITE}
            d="M18 7H46L53 13H11L18 7Z"
          />

          <Path
            fill={WHITE}
            d="M17 17H47V20H17V17Z"
          />

          <Path
            fill={WHITE}
            d="M17 23H47V26H17V23Z"
          />

          <Path
            fill={WHITE}
            d="M20 31C20 29.3 21.3 28 23 28H41C42.7 28 44 29.3 44 31V45C44 46.7 42.7 48 41 48H23C21.3 48 20 46.7 20 45V31Z"
          />

          <Path
            fill={BLUE}
            d="M25 38C26.8 35.8 29.1 34.5 32 34.5C34.9 34.5 37.2 35.8 39 38C37.2 40.2 34.9 41.5 32 41.5C29.1 41.5 26.8 40.2 25 38Z"
          />
        </>
      ) : (
        <>
          <Path
            stroke={BLUE}
            strokeWidth="3"
            strokeLinejoin="round"
            d="M11 13L18 7H46L53 13V51C53 54.3 50.3 57 47 57H17C13.7 57 11 54.3 11 51V13Z"
          />

          <Path
            stroke={BLUE}
            strokeWidth="3"
            strokeLinejoin="round"
            d="M18 7H46L53 13H11L18 7Z"
          />

          <Path
            stroke={BLUE}
            strokeWidth="3"
            d="M17 18.5H47"
          />

          <Path
            stroke={BLUE}
            strokeWidth="3"
            d="M17 24.5H47"
          />

          <Path
            stroke={BLUE}
            strokeWidth="3"
            strokeLinejoin="round"
            d="M20 31C20 29.3 21.3 28 23 28H41C42.7 28 44 29.3 44 31V45C44 46.7 42.7 48 41 48H23C21.3 48 20 46.7 20 45V31Z"
          />

          <Path
            stroke={BLUE}
            strokeWidth="2.5"
            strokeLinejoin="round"
            d="M25 38C26.8 35.8 29.1 34.5 32 34.5C34.9 34.5 37.2 35.8 39 38C37.2 40.2 34.9 41.5 32 41.5C29.1 41.5 26.8 40.2 25 38Z"
          />
        </>
      )}
    </Svg>
  );
}

function HomeIcon({
  focused,
  size,
}: {
  focused: boolean;
  size: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 640 640"
    >
      <Path
        fill={BLUE}
        d={focused ? HOME_SELECTED : HOME_NOT_SELECTED}
      />
    </Svg>
  );
}

function TabButton(props: any) {
  return (
    <TouchableOpacity
      {...props}
      activeOpacity={0.9}
      style={[
        props.style,
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 44,
          marginHorizontal: 6,
          paddingHorizontal: 10,
          backgroundColor: WHITE,
          borderWidth: 0,
          shadowOpacity: 0,
          elevation: 0,
        },
      ]}
    >
      {props.children}
    </TouchableOpacity>
  );
}

function WalletButton(props: any) {
  return (
    <TouchableOpacity
      {...props}
      activeOpacity={0.9}
      style={[
        props.style,
        {
          top: -18,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: WHITE,
          borderRadius: 18,
          width: 64,
          height: 64,
          marginHorizontal: 10,
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 6,
          borderWidth: 0,
        },
      ]}
    >
      {props.children}
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { walletBalance } = useFreshStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: BLUE,
        tabBarInactiveTintColor: BLUE,

        tabBarStyle: {
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
          borderTopColor: '#F1F5F9',
          backgroundColor: WHITE,
          borderTopWidth: 1,
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 6,
        },

        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: WHITE,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',

          tabBarButton: (props: any) => (
            <TabButton {...props} />
          ),

          tabBarLabel: () => (
            <Text
              style={{
                color: BLUE,
                fontSize: 11,
                fontWeight: '600',
              }}
            >
              Home
            </Text>
          ),

          tabBarIcon: ({ focused, size }) => (
            <HomeIcon
              focused={focused}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',

          tabBarButton: (props: any) => (
            <TabButton {...props} />
          ),

          tabBarLabel: () => (
            <Text
              style={{
                color: BLUE,
                fontSize: 11,
                fontWeight: '600',
              }}
            >
              Products
            </Text>
          ),

          tabBarIcon: ({ focused, size }) => (
            <MilkPacketIcon
              focused={focused}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',

          tabBarButton: (props: any) => (
            <WalletButton {...props} />
          ),

          tabBarLabel: () => (
            <Text
              style={{
                color: BLUE,
                fontSize: 10,
                fontWeight: '700',
              }}
            >
              ₹{Number(walletBalance ?? 0).toFixed(2)}
            </Text>
          ),

          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={
                focused
                  ? 'wallet'
                  : 'wallet-outline'
              }
              size={size + 2}
              color={BLUE}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: 'My Orders',

          tabBarButton: (props: any) => (
            <TabButton {...props} />
          ),

          tabBarLabel: () => (
            <Text
              style={{
                color: BLUE,
                fontSize: 11,
                fontWeight: '600',
              }}
            >
              My Orders
            </Text>
          ),

          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={
                focused
                  ? 'calendar'
                  : 'calendar-outline'
              }
              size={size}
              color={BLUE}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',

          tabBarButton: (props: any) => (
            <TabButton {...props} />
          ),

          tabBarLabel: () => (
            <Text
              style={{
                color: BLUE,
                fontSize: 11,
                fontWeight: '600',
              }}
            >
              Account
            </Text>
          ),

          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={
                focused
                  ? 'person'
                  : 'person-outline'
              }
              size={size}
              color={BLUE}
            />
          ),
        }}
      />
    </Tabs>
  );
}