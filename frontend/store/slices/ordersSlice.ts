import axios from 'axios';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/store/api';
import { orders as seededOrders } from '@/lib/mockData';
import { Order, OrderStatus } from '@/types/fresh';

type ApiOrder = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity_label: string;
  quantity: number;
  delivery_date: string;
  slot: 'MORNING' | 'EVENING';
  price_at_order: number | string;
  total_amount: number | string;
  status: 'SCHEDULED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
};

type ApiResponse<T> = { data: T };
type OrdersState = {
  items: Order[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
};

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : 'Unable to load deliveries';
}

function toOrder(order: ApiOrder): Order {
  const status: OrderStatus = order.status === 'DELIVERED'
    ? 'Delivered'
    : order.status === 'CANCELLED'
      ? 'Cancelled'
      : 'Upcoming';
  const price = Number(order.price_at_order);

  return {
    id: order.id,
    date: order.delivery_date,
    items: [{
      productId: order.product_id,
      name: `${order.product_name} ${order.quantity_label}`.trim(),
      quantity: order.quantity,
      price,
    }],
    itemTotal: Number(order.total_amount),
    deliveryFee: 0,
    walletUsed: 0,
    totalPaid: Number(order.total_amount),
    status,
    deliveryAddress: '',
    deliverySlot: order.slot === 'MORNING' ? 'Morning' : 'Evening',
  };
}

export const fetchOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
  'orders/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<ApiOrder[]>>('/orders');
      return response.data.data.map(toOrder);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: seededOrders, isLoading: false, hasLoaded: false, error: null } as OrdersState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => { state.items.unshift(action.payload); },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: OrderStatus }>) => {
      const order = state.items.find((item) => item.id === action.payload.id);
      if (order) order.status = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
        state.hasLoaded = true;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Unable to load deliveries';
      });
  },
});

export const { addOrder, updateOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
