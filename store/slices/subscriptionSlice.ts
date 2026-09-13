import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { subscription as seededSubscription } from '@/lib/mockData';
import { Subscription } from '@/types/fresh';

type SubscriptionState = { items: Subscription[]; activeId: string | null };

const initialState: SubscriptionState = {
  items: [seededSubscription],
  activeId: seededSubscription.id,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    addSubscription: (state, action: PayloadAction<Subscription>) => {
      state.items.unshift(action.payload);
      state.activeId = action.payload.id;
    },
    updateSubscription: (state, action: PayloadAction<Partial<Subscription> & { id?: string }>) => {
      const id = action.payload.id ?? state.activeId;
      const sub = state.items.find((item) => item.id === id);
      if (sub) Object.assign(sub, action.payload);
    },
    setActiveSubscription: (state, action: PayloadAction<string>) => {
      if (state.items.some((item) => item.id === action.payload)) state.activeId = action.payload;
    },
    removeSubscription: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (state.activeId === action.payload) state.activeId = state.items[0]?.id ?? null;
    },
  },
});

export const { addSubscription, updateSubscription, setActiveSubscription, removeSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
