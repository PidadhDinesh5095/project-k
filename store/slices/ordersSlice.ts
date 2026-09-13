import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { orders as seededOrders } from '@/lib/mockData';
import { Order, OrderStatus } from '@/types/fresh';

type OrdersState = { items: Order[] };

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: seededOrders } as OrdersState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => { state.items.unshift(action.payload); },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: OrderStatus }>) => {
      const order = state.items.find((item) => item.id === action.payload.id);
      if (order) order.status = action.payload.status;
    },
  },
});

export const { addOrder, updateOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
