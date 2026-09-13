

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import {
  EmptyState,
  StatusPill,
} from '@/components/FreshComponents';
import { useAppSelector } from '@/store/hooks';
import { formatDate } from '@/lib/cutoff';

const dayNames = [
  'SUN',
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
];

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type Filter = 'All' | 'Upcoming' | 'Delivered' | 'Cancelled';

const filters: Filter[] = [
  'All',
  'Upcoming',
  'Delivered',
  'Cancelled',
];

export default function OrdersScreen() {
  const orders = useAppSelector(
    (state) => state.orders.items
  );

  const [filter, setFilter] = useState<Filter>('All');
  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const [viewMonth, setViewMonth] = useState(8);
  const [viewYear, setViewYear] = useState(2026);

  const dates = useMemo(() => {
    const daysInMonth = new Date(
      viewYear,
      viewMonth + 1,
      0
    ).getDate();

    return Array.from(
      { length: daysInMonth },
      (_, i) => {
        const dayNum = i + 1;

        const date = new Date(
          viewYear,
          viewMonth,
          dayNum
        );

        const value = date
          .toISOString()
          .slice(0, 10);

        return {
          value,
          day: dayNames[date.getDay()],
          dateNum: dayNum,
        };
      }
    );
  }, [viewMonth, viewYear]);

  const filtered = useMemo(() => {
    let result =
      filter === 'All'
        ? orders
        : orders.filter(
            (order) => order.status === filter
          );

    if (selectedDate) {
      result = result.filter(
        (order) => order.date === selectedDate
      );
    }

    return result;
  }, [filter, selectedDate, orders]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();

    filtered.forEach((order) => {
      const list = map.get(order.date) ?? [];

      list.push(order);
      map.set(order.date, list);
    });

    return Array.from(map.entries()).sort(
      (left, right) =>
        left[0].localeCompare(right[0])
    );
  }, [filtered]);

  const dateHasOrders = (date: string) =>
    orders.some(
      (order) => order.date === date
    );

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  return (
    <View className="flex-1 bg-[#F7F9FC]">

      {/* ================= HEADER ================= */}

      <View className="bg-[#F7F9FC]">

        {/* Top Bar */}
        <View className="mb-3 px-5 pt-[52px]">
          <Text className="text-[22px] font-extrabold text-[#111827]">
            My Orders
          </Text>
        </View>

        {/* Month Selector */}
        <View className="mb-3 flex-row items-center justify-center gap-4">

          <Pressable
            onPress={prevMonth}
            hitSlop={12}
          >
            <ChevronLeft
              size={22}
              color="#111827"
            />
          </Pressable>

          <Text className="text-[16px] font-extrabold text-[#111827]">
            {monthNames[viewMonth]} {viewYear}
          </Text>

          <Pressable
            onPress={nextMonth}
            hitSlop={12}
          >
            <ChevronRight
              size={22}
              color="#111827"
            />
          </Pressable>

        </View>

        {/* Date Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            gap: 8,
            paddingBottom: 8,
          }}
        >
          {dates.map((d) => {
            const isSelected =
              selectedDate === d.value;

            const hasOrders =
              dateHasOrders(d.value);

            return (
              <Pressable
                key={d.value}
                className={
                  isSelected
                    ? 'h-[68px] w-[52px] items-center justify-center rounded-[14px] border border-[#1E4FFF] bg-[#1E4FFF]'
                    : 'h-[68px] w-[52px] items-center justify-center rounded-[14px] border border-[#E2E8F0] bg-white'
                }
                onPress={() =>
                  setSelectedDate(
                    isSelected
                      ? null
                      : d.value
                  )
                }
              >

                <Text
                  className={
                    isSelected
                      ? 'text-[9px] font-bold text-[#DCE6FF]'
                      : 'text-[9px] font-bold text-[#64748B]'
                  }
                >
                  {d.day}
                </Text>

                <Text
                  className={
                    isSelected
                      ? 'mt-[3px] text-[16px] font-extrabold text-white'
                      : 'mt-[3px] text-[16px] font-extrabold text-[#111827]'
                  }
                >
                  {d.dateNum}
                </Text>

                {hasOrders && (
                  <View
                    className={
                      isSelected
                        ? 'mt-[5px] h-[5px] w-[5px] rounded-[2.5px] bg-white'
                        : 'mt-[5px] h-[5px] w-[5px] rounded-[2.5px] bg-[#1E4FFF]'
                    }
                  />
                )}

              </Pressable>
            );
          })}
        </ScrollView>

        {/* Filters */}
        <View className="my-[10px] flex-row gap-2 px-5">

          {filters.map((f) => {
            const active = filter === f;

            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                className={
                  active
                    ? 'h-8 justify-center rounded-[14px] border border-[#1E4FFF] bg-[#1E4FFF] px-[14px]'
                    : 'h-8 justify-center rounded-[14px] border border-[#E2E8F0] bg-white px-[14px]'
                }
              >
                <Text
                  className={
                    active
                      ? 'text-[12px] font-semibold leading-[15px] text-white'
                      : 'text-[12px] font-semibold leading-[15px] text-[#111827]'
                  }
                >
                  {f}
                </Text>
              </Pressable>
            );
          })}

        </View>

        {/* Selected Date Banner */}
        {selectedDate && (
          <View className="flex-row items-center gap-[6px] px-5 pb-2">

            <Calendar
              size={13}
              color="#1E4FFF"
            />

            <Text className="flex-1 text-[12px] font-semibold text-[#1E4FFF]">
              Showing orders for{' '}
              {formatDate(selectedDate)}
            </Text>

            <Pressable
              onPress={() =>
                setSelectedDate(null)
              }
              hitSlop={8}
            >
              <Text className="text-[12px] font-bold text-[#1E4FFF]">
                Clear
              </Text>
            </Pressable>

          </View>
        )}

      </View>


      {/* ================= ORDER LIST ================= */}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      >

        {grouped.length === 0 ? (

          <EmptyState
            icon="📦"
            title="No orders found"
            body={
              selectedDate
                ? 'No orders on this date. Try another date or filter.'
                : 'Orders matching this filter will appear here.'
            }
            action="Browse products"
            onAction={() =>
              router.push('/products')
            }
          />

        ) : (

          grouped.map(
            ([date, dateOrders]) => (

              <View
                key={date}
                className="mb-5"
              >

                {/* Date Header */}
                <View className="mb-[10px] flex-row items-center gap-[6px]">

                  <Calendar
                    size={14}
                    color="#1E4FFF"
                  />

                  <Text className="text-[14px] font-extrabold text-[#111827]">
                    {formatDate(date)}
                  </Text>

                </View>


                {/* Orders */}
                {dateOrders.map((order) => (

                  <Pressable
                    key={order.id}
                    className="mb-[10px] rounded-[16px] border border-[#E2E8F0] bg-white p-[14px]"
                    onPress={() =>
                      router.push(
                        `/order/${order.id}`
                      )
                    }
                  >

                    {/* Order Top */}
                    <View className="flex-row items-center justify-between">

                      <Text className="text-[13px] font-bold text-[#111827]">
                        {order.id}
                      </Text>

                      <StatusPill
                        label={order.status}
                      />

                    </View>


                    {/* Items */}
                    <Text
                      className="mt-2 text-[14px] font-semibold text-[#111827]"
                      numberOfLines={1}
                    >
                      {order.items
                        .map((i) => i.name)
                        .join(', ')}
                    </Text>


                    {/* Bottom */}
                    <View className="mt-3 flex-row items-center justify-between border-t border-[#F1F5F9] pt-3">

                      <View>

                        <Text className="text-[15px] font-extrabold text-[#111827]">
                          ₹{order.totalPaid}
                        </Text>

                        <Text className="mt-[2px] text-[11px] text-[#64748B]">
                          {order.items.length}{' '}
                          item
                          {order.items.length > 1
                            ? 's'
                            : ''}
                        </Text>

                      </View>

                      <Text className="text-[12px] font-bold text-[#1E4FFF]">
                        View details →
                      </Text>

                    </View>

                  </Pressable>

                ))}

              </View>

            )
          )

        )}

      </ScrollView>

    </View>
  );
}
